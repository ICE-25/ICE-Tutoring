-- ============================================================================
-- ICE Tutoring — initial schema: auth profiles, learners, enrollments
-- ============================================================================
-- Design notes:
--   * The public enroll form must work for logged-out visitors, so
--     `enrollments` accepts anonymous INSERTs but nobody can read rows back
--     except the owning parent and admins. This is the standard lead-capture
--     pattern; it does leave the endpoint spam-exposed, so pair it with
--     Supabase bot protection (Turnstile) before launch.
--   * Every table has RLS enabled with explicit policies. There is no
--     "allow all" policy anywhere.
--   * auth.uid() is wrapped in a scalar subquery — `(select auth.uid())` —
--     so Postgres caches it per-statement instead of re-evaluating per row.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type public.user_role as enum ('parent', 'learner', 'tutor', 'admin');

-- Mirrors the three options in the enroll form's grade select.
create type public.grade_band as enum ('primary', 'middle', 'upper');

create type public.enrollment_status as enum (
  'new',        -- just submitted, nobody has looked at it yet
  'contacted',  -- team has reached out on WhatsApp
  'matched',    -- a tutor has been assigned
  'active',     -- lessons under way
  'cancelled'
);

-- ----------------------------------------------------------------------------
-- Shared triggers
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles — one row per auth.users record
-- ----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  phone       text,
  role        public.user_role not null default 'parent',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Public profile data extending auth.users. Created automatically on signup.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Populate a profile whenever a user signs up. SECURITY DEFINER because the
-- new user has no session yet at the moment this fires.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin check used by policies below. SECURITY DEFINER so it can read
-- profiles without tripping the very policies it is helping to evaluate.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- learners — the children a parent enrolls
-- ----------------------------------------------------------------------------
create table public.learners (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null references public.profiles (id) on delete cascade,
  full_name   text not null check (char_length(trim(full_name)) between 2 and 120),
  grade_band  public.grade_band not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index learners_parent_id_idx on public.learners (parent_id);

create trigger learners_set_updated_at
  before update on public.learners
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- enrollments — every submission of the public enroll form
-- ----------------------------------------------------------------------------
create table public.enrollments (
  id            uuid primary key default gen_random_uuid(),

  -- Null for logged-out submissions; set when a signed-in parent submits.
  parent_id     uuid references public.profiles (id) on delete set null,
  learner_id    uuid references public.learners (id) on delete set null,

  -- Captured verbatim from the form so a lead is never lost, even if the
  -- submitter never creates an account.
  parent_name   text not null check (char_length(trim(parent_name)) between 2 and 120),
  learner_name  text not null check (char_length(trim(learner_name)) between 2 and 120),
  grade_band    public.grade_band not null,
  subject       text check (subject is null or char_length(subject) <= 60),
  phone         text not null check (char_length(trim(phone)) between 7 and 30),

  status        public.enrollment_status not null default 'new',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index enrollments_parent_id_idx on public.enrollments (parent_id);
create index enrollments_triage_idx on public.enrollments (status, created_at desc);

create trigger enrollments_set_updated_at
  before update on public.enrollments
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row level security
-- ============================================================================
alter table public.profiles    enable row level security;
alter table public.learners    enable row level security;
alter table public.enrollments enable row level security;

-- ---------------------------- profiles --------------------------------------
create policy "Users read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id or public.is_admin());

create policy "Users update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Normally the signup trigger inserts this row; this policy only covers the
-- case where a client needs to backfill its own profile.
create policy "Users insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- ---------------------------- learners --------------------------------------
create policy "Parents read their own learners"
  on public.learners for select
  to authenticated
  using ((select auth.uid()) = parent_id or public.is_admin());

create policy "Parents add their own learners"
  on public.learners for insert
  to authenticated
  with check ((select auth.uid()) = parent_id);

create policy "Parents update their own learners"
  on public.learners for update
  to authenticated
  using ((select auth.uid()) = parent_id)
  with check ((select auth.uid()) = parent_id);

create policy "Parents delete their own learners"
  on public.learners for delete
  to authenticated
  using ((select auth.uid()) = parent_id);

-- --------------------------- enrollments ------------------------------------
-- Anyone may submit, but may not claim someone else's parent_id.
create policy "Anyone can submit an enrollment"
  on public.enrollments for insert
  to anon, authenticated
  with check (parent_id is null or parent_id = (select auth.uid()));

-- Deliberately no SELECT policy for anon: submissions are write-only to the
-- public. Without a policy, RLS denies by default.
create policy "Parents read their own enrollments"
  on public.enrollments for select
  to authenticated
  using ((select auth.uid()) = parent_id or public.is_admin());

create policy "Admins update enrollments"
  on public.enrollments for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete enrollments"
  on public.enrollments for delete
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- Column-level privileges
-- ============================================================================
-- RLS decides WHICH ROWS a user may write; it does not restrict WHICH COLUMNS.
-- Without these grants a parent could PATCH their own profile with
-- {"role":"admin"}, satisfy is_admin(), and read every enrollment in the
-- database. Revoke blanket write access and re-grant only safe columns.
-- service_role is intentionally untouched so admin tooling still works.
-- ============================================================================

revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, full_name, phone) on public.profiles to authenticated;
grant update (full_name, phone)     on public.profiles to authenticated;

-- Submitters must not be able to set their own triage status.
revoke insert on public.enrollments from anon, authenticated;
grant insert (
  parent_id, learner_id, parent_name, learner_name, grade_band, subject, phone
) on public.enrollments to anon, authenticated;

-- id and parent_id are set once, never rewritten.
revoke update on public.learners from anon, authenticated;
grant update (full_name, grade_band) on public.learners to authenticated;
