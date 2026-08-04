-- ============================================================================
-- Phase A — curricula, class levels and subjects
-- ============================================================================
-- Replaces the three-value grade_band enum, which could not express "Cambridge
-- Year 10" and forced such learners into "Middle School (S.1–S.4)".
--
-- Curriculum and class are stored as separate FK columns so reporting can slice
-- by either. Existing rows are backfilled as UNEB, which is correct for every
-- enrollment taken so far.
--
-- Reference data is public-read (the enroll form needs it while logged out) and
-- admin-write. Column grants are applied up front, as established.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- curricula
-- ----------------------------------------------------------------------------
create table public.curricula (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique check (char_length(code) between 2 and 20),
  name        text not null,
  country     text,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger curricula_set_updated_at
  before update on public.curricula
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- class_levels — the year/class labels belonging to one curriculum
-- ----------------------------------------------------------------------------
create table public.class_levels (
  id            uuid primary key default gen_random_uuid(),
  curriculum_id uuid not null references public.curricula (id) on delete cascade,
  code          text not null,
  label         text not null,
  stage         text not null,
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  unique (curriculum_id, code)
);

create index class_levels_curriculum_idx
  on public.class_levels (curriculum_id, sort_order);

create trigger class_levels_set_updated_at
  before update on public.class_levels
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- subjects — was a hardcoded array in two places
-- ----------------------------------------------------------------------------
create table public.subjects (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  category    text not null check (category in ('stem', 'language', 'humanities', 'other')),
  -- Lets a subject be advertised without being bookable, or vice versa.
  is_bookable boolean not null default true,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger subjects_set_updated_at
  before update on public.subjects
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Seed data
-- ============================================================================
insert into public.curricula (code, name, country, sort_order) values
  ('UNEB',  'UNEB (Uganda National Curriculum)', 'Uganda',        1),
  ('CIE',   'Cambridge (CIE)',                   'International', 2),
  ('IB',    'International Baccalaureate',       'International', 3),
  ('KCSE',  'KCSE / CBC (Kenya)',                'Kenya',         4),
  ('WAEC',  'WAEC (West Africa)',                'West Africa',   5);

-- UNEB -----------------------------------------------------------------------
insert into public.class_levels (curriculum_id, code, label, stage, sort_order)
select c.id, v.code, v.label, v.stage, v.ord
from public.curricula c
cross join (values
  ('P.1','P.1','Primary',1),   ('P.2','P.2','Primary',2),
  ('P.3','P.3','Primary',3),   ('P.4','P.4','Primary',4),
  ('P.5','P.5','Primary',5),   ('P.6','P.6','Primary',6),
  ('P.7','P.7','Primary',7),
  ('S.1','S.1','O-Level',8),   ('S.2','S.2','O-Level',9),
  ('S.3','S.3','O-Level',10),  ('S.4','S.4','O-Level',11),
  ('S.5','S.5','A-Level',12),  ('S.6','S.6','A-Level',13)
) as v(code,label,stage,ord)
where c.code = 'UNEB';

-- Cambridge ------------------------------------------------------------------
insert into public.class_levels (curriculum_id, code, label, stage, sort_order)
select c.id, v.code, v.label, v.stage, v.ord
from public.curricula c
cross join (values
  ('Y1','Year 1','Primary',1),          ('Y2','Year 2','Primary',2),
  ('Y3','Year 3','Primary',3),          ('Y4','Year 4','Primary',4),
  ('Y5','Year 5','Primary',5),          ('Y6','Year 6','Primary',6),
  ('Y7','Year 7','Lower Secondary',7),  ('Y8','Year 8','Lower Secondary',8),
  ('Y9','Year 9','Lower Secondary',9),
  ('Y10','Year 10','IGCSE',10),         ('Y11','Year 11','IGCSE',11),
  ('Y12','Year 12','A-Level',12),       ('Y13','Year 13','A-Level',13)
) as v(code,label,stage,ord)
where c.code = 'CIE';

-- IB -------------------------------------------------------------------------
insert into public.class_levels (curriculum_id, code, label, stage, sort_order)
select c.id, v.code, v.label, v.stage, v.ord
from public.curricula c
cross join (values
  ('PYP1','Year 1','PYP',1),   ('PYP2','Year 2','PYP',2),
  ('PYP3','Year 3','PYP',3),   ('PYP4','Year 4','PYP',4),
  ('PYP5','Year 5','PYP',5),
  ('MYP1','Year 6','MYP',6),   ('MYP2','Year 7','MYP',7),
  ('MYP3','Year 8','MYP',8),   ('MYP4','Year 9','MYP',9),
  ('MYP5','Year 10','MYP',10),
  ('DP1','Year 11','DP',11),   ('DP2','Year 12','DP',12)
) as v(code,label,stage,ord)
where c.code = 'IB';

-- KCSE / CBC -----------------------------------------------------------------
insert into public.class_levels (curriculum_id, code, label, stage, sort_order)
select c.id, v.code, v.label, v.stage, v.ord
from public.curricula c
cross join (values
  ('G1','Grade 1','Primary',1),  ('G2','Grade 2','Primary',2),
  ('G3','Grade 3','Primary',3),  ('G4','Grade 4','Primary',4),
  ('G5','Grade 5','Primary',5),  ('G6','Grade 6','Primary',6),
  ('G7','Grade 7','Junior Secondary',7),
  ('G8','Grade 8','Junior Secondary',8),
  ('G9','Grade 9','Junior Secondary',9),
  ('G10','Grade 10','Senior Secondary',10),
  ('G11','Grade 11','Senior Secondary',11),
  ('G12','Grade 12','Senior Secondary',12)
) as v(code,label,stage,ord)
where c.code = 'KCSE';

-- WAEC -----------------------------------------------------------------------
insert into public.class_levels (curriculum_id, code, label, stage, sort_order)
select c.id, v.code, v.label, v.stage, v.ord
from public.curricula c
cross join (values
  ('P1','Primary 1','Primary',1), ('P2','Primary 2','Primary',2),
  ('P3','Primary 3','Primary',3), ('P4','Primary 4','Primary',4),
  ('P5','Primary 5','Primary',5), ('P6','Primary 6','Primary',6),
  ('JSS1','JSS 1','Junior Secondary',7),
  ('JSS2','JSS 2','Junior Secondary',8),
  ('JSS3','JSS 3','Junior Secondary',9),
  ('SSS1','SSS 1','Senior Secondary',10),
  ('SSS2','SSS 2','Senior Secondary',11),
  ('SSS3','SSS 3','Senior Secondary',12)
) as v(code,label,stage,ord)
where c.code = 'WAEC';

-- Subjects -------------------------------------------------------------------
insert into public.subjects (code, name, category, sort_order) values
  ('MATH',  'Mathematics', 'stem',     1),
  ('SCI',   'Science',     'stem',     2),
  ('PHY',   'Physics',     'stem',     3),
  ('CHEM',  'Chemistry',   'stem',     4),
  ('BIO',   'Biology',     'stem',     5),
  ('CODE',  'Coding',      'stem',     6),
  ('ROBO',  'Robotics',    'stem',     7),
  ('ENG',   'English',     'language', 8),
  ('FRE',   'French',      'language', 9);

-- ============================================================================
-- Attach curriculum + class to learners and enrollments
-- ============================================================================
alter table public.learners
  add column curriculum_id  uuid references public.curricula (id),
  add column class_level_id uuid references public.class_levels (id);

alter table public.enrollments
  add column curriculum_id  uuid references public.curricula (id),
  add column class_level_id uuid references public.class_levels (id);

-- Backfill: every existing row predates multi-curriculum support and is UNEB.
-- grade_band was a band, not a single class, so map to the first class in it.
update public.learners l
set curriculum_id = c.id,
    class_level_id = cl.id
from public.curricula c
join public.class_levels cl on cl.curriculum_id = c.id
where c.code = 'UNEB'
  and l.curriculum_id is null
  and cl.code = case l.grade_band
        when 'primary' then 'P.1'
        when 'middle'  then 'S.1'
        when 'upper'   then 'S.5'
      end;

update public.enrollments e
set curriculum_id = c.id,
    class_level_id = cl.id
from public.curricula c
join public.class_levels cl on cl.curriculum_id = c.id
where c.code = 'UNEB'
  and e.curriculum_id is null
  and cl.code = case e.grade_band
        when 'primary' then 'P.1'
        when 'middle'  then 'S.1'
        when 'upper'   then 'S.5'
      end;

-- New rows must carry the real values; grade_band becomes optional legacy data
-- rather than being dropped, so the backfill stays auditable.
alter table public.learners    alter column grade_band drop not null;
alter table public.enrollments alter column grade_band drop not null;

create index enrollments_curriculum_idx on public.enrollments (curriculum_id, class_level_id);
create index learners_curriculum_idx    on public.learners (curriculum_id, class_level_id);

-- ============================================================================
-- Row level security — reference data is public read, admin write
-- ============================================================================
alter table public.curricula    enable row level security;
alter table public.class_levels enable row level security;
alter table public.subjects     enable row level security;

create policy "Anyone reads active curricula"
  on public.curricula for select
  to anon, authenticated
  using (is_active or public.is_admin());

create policy "Admins manage curricula"
  on public.curricula for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Anyone reads active class levels"
  on public.class_levels for select
  to anon, authenticated
  using (is_active or public.is_admin());

create policy "Admins manage class levels"
  on public.class_levels for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Anyone reads active subjects"
  on public.subjects for select
  to anon, authenticated
  using (is_active or public.is_admin());

create policy "Admins manage subjects"
  on public.subjects for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Reference data is never written by a normal session.
revoke insert, update, delete on public.curricula    from anon, authenticated;
revoke insert, update, delete on public.class_levels from anon, authenticated;
revoke insert, update, delete on public.subjects     from anon, authenticated;

-- Enrollments are written by the service role, but a signed-in parent may also
-- insert their own; allow the two new columns through.
grant insert (
  parent_id, learner_id, parent_name, learner_name,
  grade_band, curriculum_id, class_level_id, subject, phone
) on public.enrollments to authenticated;
