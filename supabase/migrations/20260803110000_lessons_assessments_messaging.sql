-- ============================================================================
-- ICE Tutoring — phase 3: tutors, lessons, assessments, messaging
-- ============================================================================
-- Ownership model:
--   A parent reaches everything through learners.parent_id. Lessons and
--   assessments belong to a learner, so their policies test that the learner
--   belongs to the caller. The learners subquery is itself under RLS, which
--   is fine — it evaluates as the calling user and returns only their rows.
--
--   Writes are admin-only for now. Tutors have records but not accounts yet;
--   tutors.profile_id is reserved so they can be linked to a login later
--   without a migration.
--
-- Column grants are applied up front. RLS restricts rows, never columns —
-- forgetting that is what allowed the earlier role-escalation bug.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type public.lesson_format as enum ('online', 'physical');
create type public.lesson_status as enum ('scheduled', 'completed', 'cancelled');

-- ----------------------------------------------------------------------------
-- tutors
-- ----------------------------------------------------------------------------
create table public.tutors (
  id          uuid primary key default gen_random_uuid(),
  -- Reserved for when tutors get their own logins.
  profile_id  uuid unique references public.profiles (id) on delete set null,
  full_name   text not null check (char_length(trim(full_name)) between 2 and 120),
  headline    text check (headline is null or char_length(headline) <= 160),
  bio         text check (bio is null or char_length(bio) <= 2000),
  subjects    text[] not null default '{}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger tutors_set_updated_at
  before update on public.tutors
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- lessons
-- ----------------------------------------------------------------------------
create table public.lessons (
  id               uuid primary key default gen_random_uuid(),
  learner_id       uuid not null references public.learners (id) on delete cascade,
  tutor_id         uuid references public.tutors (id) on delete set null,
  subject          text not null check (char_length(trim(subject)) between 2 and 60),
  starts_at        timestamptz not null,
  duration_minutes integer not null default 60
                     check (duration_minutes between 15 and 480),
  format           public.lesson_format not null default 'online',
  location         text check (location is null or char_length(location) <= 200),
  meeting_url      text check (meeting_url is null or char_length(meeting_url) <= 500),
  status           public.lesson_status not null default 'scheduled',
  notes            text check (notes is null or char_length(notes) <= 2000),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index lessons_learner_idx on public.lessons (learner_id, starts_at desc);
create index lessons_upcoming_idx on public.lessons (starts_at) where status = 'scheduled';

create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- assessments
-- ----------------------------------------------------------------------------
create table public.assessments (
  id          uuid primary key default gen_random_uuid(),
  learner_id  uuid not null references public.learners (id) on delete cascade,
  subject     text not null check (char_length(trim(subject)) between 2 and 60),
  title       text not null check (char_length(trim(title)) between 2 and 160),
  term        text check (term is null or char_length(term) <= 60),
  score       numeric(5, 2) check (score is null or score >= 0),
  max_score   numeric(5, 2) check (max_score is null or max_score > 0),
  grade       text check (grade is null or char_length(grade) <= 10),
  assessed_on date not null default current_date,
  comment     text check (comment is null or char_length(comment) <= 2000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint assessments_score_within_max
    check (score is null or max_score is null or score <= max_score)
);

create index assessments_learner_idx on public.assessments (learner_id, assessed_on desc);

create trigger assessments_set_updated_at
  before update on public.assessments
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- conversations + messages
-- ----------------------------------------------------------------------------
create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  parent_id       uuid not null references public.profiles (id) on delete cascade,
  subject         text check (subject is null or char_length(subject) <= 160),
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index conversations_parent_idx on public.conversations (parent_id, last_message_at desc);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text not null check (char_length(trim(body)) between 1 and 4000),
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- Keep conversations.last_message_at current so threads sort correctly.
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- ============================================================================
-- Row level security
-- ============================================================================
alter table public.tutors        enable row level security;
alter table public.lessons       enable row level security;
alter table public.assessments   enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- Reusable ownership test: does this learner belong to the caller?
create or replace function public.owns_learner(p_learner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.learners l
    where l.id = p_learner_id
      and l.parent_id = (select auth.uid())
  );
$$;

-- ------------------------------- tutors -------------------------------------
-- Tutor profiles are public marketing data; anyone may read active ones.
create policy "Anyone reads active tutors"
  on public.tutors for select
  to anon, authenticated
  using (is_active or public.is_admin());

create policy "Admins manage tutors"
  on public.tutors for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------ lessons -------------------------------------
create policy "Parents read their learners' lessons"
  on public.lessons for select
  to authenticated
  using (public.is_admin() or public.owns_learner(learner_id));

create policy "Admins manage lessons"
  on public.lessons for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------- assessments -----------------------------------
create policy "Parents read their learners' assessments"
  on public.assessments for select
  to authenticated
  using (public.is_admin() or public.owns_learner(learner_id));

create policy "Admins manage assessments"
  on public.assessments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------- conversations ----------------------------------
create policy "Parents read their own conversations"
  on public.conversations for select
  to authenticated
  using (public.is_admin() or parent_id = (select auth.uid()));

create policy "Parents start their own conversations"
  on public.conversations for insert
  to authenticated
  with check (public.is_admin() or parent_id = (select auth.uid()));

create policy "Admins manage conversations"
  on public.conversations for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------ messages ------------------------------------
create or replace function public.in_conversation(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversations c
    where c.id = p_conversation_id
      and c.parent_id = (select auth.uid())
  );
$$;

create policy "Participants read messages"
  on public.messages for select
  to authenticated
  using (public.is_admin() or public.in_conversation(conversation_id));

-- A sender may only post as themselves, and only into their own thread.
create policy "Participants send messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and (public.is_admin() or public.in_conversation(conversation_id))
  );

create policy "Participants mark messages read"
  on public.messages for update
  to authenticated
  using (public.is_admin() or public.in_conversation(conversation_id))
  with check (public.is_admin() or public.in_conversation(conversation_id));

-- ============================================================================
-- Column-level privileges
-- ============================================================================
-- Parents get no direct write access to lessons or assessments at all; those
-- are admin-only and flow through policies above. What a parent CAN write is
-- narrowly scoped here.
-- ============================================================================

-- NOTE: "admin" is an application role stored in profiles.role, NOT a Postgres
-- role — admins connect as `authenticated` like everyone else. So column
-- grants here must stay wide enough for admins to work, and it is the RLS
-- policies above (which call is_admin()) that keep ordinary parents out.
--
-- tutors, lessons and assessments therefore get NO revokes: non-admins have no
-- write policy on them at all, so RLS already denies by default.

-- conversations: a parent may open a thread and retitle it, nothing more.
-- last_message_at is maintained by the touch_conversation() trigger, which
-- runs SECURITY DEFINER and so is unaffected by these grants.
revoke insert, update on public.conversations from anon, authenticated;
grant insert (parent_id, subject) on public.conversations to authenticated;
grant update (subject)            on public.conversations to authenticated;

-- messages: bodies are immutable once sent — only the read receipt is
-- writable, so nobody can silently rewrite what they said.
revoke insert, update on public.messages from anon, authenticated;
grant insert (conversation_id, sender_id, body) on public.messages to authenticated;
grant update (read_at)                         on public.messages to authenticated;
