-- ============================================================================
-- Phase B — tutor applications and onboarding
-- ============================================================================
-- Key safety property: an applicant must never be able to approve themselves.
--
-- `status` and `is_active` on tutors, and `profiles.role`, are therefore NOT
-- grantable to `authenticated`. Admins connect as `authenticated` too, so the
-- approval path deliberately runs server-side through the service-role client
-- behind requireAdmin(). This is the same lesson as the earlier role
-- escalation: RLS restricts rows, column grants restrict fields.
-- ============================================================================

create type public.tutor_status as enum (
  'draft',      -- started, not yet submitted
  'submitted',  -- awaiting admin review
  'approved',   -- may be matched to learners
  'rejected',
  'suspended'
);

-- ----------------------------------------------------------------------------
-- Extend tutors
-- ----------------------------------------------------------------------------
alter table public.tutors
  add column status            public.tutor_status not null default 'draft',
  add column email             text,
  add column phone             text,
  add column years_experience  integer check (years_experience is null or years_experience between 0 and 60),
  add column qualifications    text check (qualifications is null or char_length(qualifications) <= 2000),
  add column availability_note text check (availability_note is null or char_length(availability_note) <= 1000),
  add column base_location     text check (base_location is null or char_length(base_location) <= 200),
  add column travel_radius_km  integer check (travel_radius_km is null or travel_radius_km between 0 and 200),
  add column submitted_at      timestamptz;

-- A person may hold only one tutor record.
create unique index tutors_profile_unique on public.tutors (profile_id)
  where profile_id is not null;

create index tutors_status_idx on public.tutors (status, submitted_at desc);

-- ----------------------------------------------------------------------------
-- tutor_applications — immutable decision trail, never overwritten
-- ----------------------------------------------------------------------------
create table public.tutor_applications (
  id           uuid primary key default gen_random_uuid(),
  tutor_id     uuid not null references public.tutors (id) on delete cascade,
  submitted_at timestamptz not null default now(),
  decision     public.tutor_status,
  reviewed_by  uuid references public.profiles (id) on delete set null,
  reviewed_at  timestamptz,
  review_notes text check (review_notes is null or char_length(review_notes) <= 2000),
  created_at   timestamptz not null default now()
);

create index tutor_applications_tutor_idx
  on public.tutor_applications (tutor_id, submitted_at desc);

-- ----------------------------------------------------------------------------
-- What a tutor can teach
-- ----------------------------------------------------------------------------
create table public.tutor_subjects (
  tutor_id   uuid not null references public.tutors (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  primary key (tutor_id, subject_id)
);

create table public.tutor_curricula (
  tutor_id      uuid not null references public.tutors (id) on delete cascade,
  curriculum_id uuid not null references public.curricula (id) on delete cascade,
  primary key (tutor_id, curriculum_id)
);

create table public.tutor_class_levels (
  tutor_id       uuid not null references public.tutors (id) on delete cascade,
  class_level_id uuid not null references public.class_levels (id) on delete cascade,
  primary key (tutor_id, class_level_id)
);

create table public.tutor_availability (
  id         uuid primary key default gen_random_uuid(),
  tutor_id   uuid not null references public.tutors (id) on delete cascade,
  weekday    smallint not null check (weekday between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time   time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index tutor_availability_tutor_idx on public.tutor_availability (tutor_id, weekday);

-- ----------------------------------------------------------------------------
-- Helper: does this tutor record belong to the caller?
-- ----------------------------------------------------------------------------
create or replace function public.owns_tutor(p_tutor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tutors t
    where t.id = p_tutor_id
      and t.profile_id = (select auth.uid())
  );
$$;

-- ============================================================================
-- Row level security
-- ============================================================================
alter table public.tutor_applications  enable row level security;
alter table public.tutor_subjects      enable row level security;
alter table public.tutor_curricula     enable row level security;
alter table public.tutor_class_levels  enable row level security;
alter table public.tutor_availability  enable row level security;

-- --- tutors: applicants manage their own record until it is approved --------
-- The existing "Anyone reads active tutors" policy is replaced so that
-- unapproved applications are not publicly visible.
drop policy if exists "Anyone reads active tutors" on public.tutors;

create policy "Public reads approved tutors"
  on public.tutors for select
  to anon, authenticated
  using (
    (status = 'approved' and is_active)
    or public.is_admin()
    or profile_id = (select auth.uid())
  );

create policy "Applicants create their own tutor record"
  on public.tutors for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

create policy "Applicants edit their own tutor record"
  on public.tutors for update
  to authenticated
  using (profile_id = (select auth.uid()) or public.is_admin())
  with check (profile_id = (select auth.uid()) or public.is_admin());

-- --- applications -----------------------------------------------------------
create policy "Applicants read their own applications"
  on public.tutor_applications for select
  to authenticated
  using (public.is_admin() or public.owns_tutor(tutor_id));

create policy "Applicants submit their own applications"
  on public.tutor_applications for insert
  to authenticated
  with check (public.owns_tutor(tutor_id));

-- --- teaching profile join tables ------------------------------------------
create policy "Read teaching subjects" on public.tutor_subjects for select
  to anon, authenticated using (true);
create policy "Applicants set their subjects" on public.tutor_subjects for insert
  to authenticated with check (public.owns_tutor(tutor_id) or public.is_admin());
create policy "Applicants clear their subjects" on public.tutor_subjects for delete
  to authenticated using (public.owns_tutor(tutor_id) or public.is_admin());

create policy "Read teaching curricula" on public.tutor_curricula for select
  to anon, authenticated using (true);
create policy "Applicants set their curricula" on public.tutor_curricula for insert
  to authenticated with check (public.owns_tutor(tutor_id) or public.is_admin());
create policy "Applicants clear their curricula" on public.tutor_curricula for delete
  to authenticated using (public.owns_tutor(tutor_id) or public.is_admin());

create policy "Read teaching class levels" on public.tutor_class_levels for select
  to anon, authenticated using (true);
create policy "Applicants set their class levels" on public.tutor_class_levels for insert
  to authenticated with check (public.owns_tutor(tutor_id) or public.is_admin());
create policy "Applicants clear their class levels" on public.tutor_class_levels for delete
  to authenticated using (public.owns_tutor(tutor_id) or public.is_admin());

create policy "Read availability" on public.tutor_availability for select
  to anon, authenticated using (true);
create policy "Applicants set their availability" on public.tutor_availability for insert
  to authenticated with check (public.owns_tutor(tutor_id) or public.is_admin());
create policy "Applicants clear their availability" on public.tutor_availability for delete
  to authenticated using (public.owns_tutor(tutor_id) or public.is_admin());

-- ============================================================================
-- Column privileges — the part that prevents self-approval
-- ============================================================================
-- An applicant owns their tutors row, so RLS alone would let them write ANY
-- column on it, including status = 'approved'. Restrict to the fields they
-- legitimately fill in. status, is_active and submitted_at are writable only
-- by the service role, i.e. only through the admin-guarded server action.
revoke insert, update on public.tutors from anon, authenticated;

grant insert (
  profile_id, full_name, headline, bio, email, phone,
  years_experience, qualifications, availability_note,
  base_location, travel_radius_km, subjects
) on public.tutors to authenticated;

grant update (
  full_name, headline, bio, email, phone,
  years_experience, qualifications, availability_note,
  base_location, travel_radius_km, subjects
) on public.tutors to authenticated;

-- Decisions are recorded by the reviewer, never by the applicant.
revoke insert, update on public.tutor_applications from anon, authenticated;
grant insert (tutor_id) on public.tutor_applications to authenticated;
