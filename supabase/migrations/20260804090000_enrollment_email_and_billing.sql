-- ============================================================================
-- Enrolment email + billing foundation
-- ============================================================================
-- Pricing model: tutors set their own hourly rate, but only inside a band the
-- admin defines per subject / class level / format. Commission is tiered by
-- the rate charged, so it can scale either up or down simply by which rows
-- exist in commission_tiers — that is a business decision, not a schema one.
--
-- The critical rule encoded here: money is FROZEN onto the booking. Rates and
-- commission percentages are copied at booking time and never joined live,
-- because a tutor raising their rate must not silently rewrite past invoices.
-- ============================================================================

-- Confirmation emails need somewhere to send to. Optional: a parent may still
-- enrol with only a phone number.
alter table public.enrollments
  add column email text check (email is null or char_length(email) <= 200);

grant insert (
  parent_id, learner_id, parent_name, learner_name,
  grade_band, curriculum_id, class_level_id, subject, phone, email
) on public.enrollments to authenticated;

-- ----------------------------------------------------------------------------
-- rate_bands — the ranges you allow tutors to price within
-- ----------------------------------------------------------------------------
create table public.rate_bands (
  id             uuid primary key default gen_random_uuid(),
  -- All three narrowing columns are optional; null means "applies to any".
  subject_id     uuid references public.subjects (id) on delete cascade,
  class_level_id uuid references public.class_levels (id) on delete cascade,
  format         public.lesson_format,
  currency       text not null default 'UGX' check (char_length(currency) = 3),
  min_rate       numeric(12, 2) not null check (min_rate >= 0),
  max_rate       numeric(12, 2) not null check (max_rate > 0),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint rate_bands_range_valid check (max_rate >= min_rate)
);

create index rate_bands_lookup_idx
  on public.rate_bands (subject_id, class_level_id, format) where is_active;

create trigger rate_bands_set_updated_at
  before update on public.rate_bands
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- tutor_rates — each tutor's chosen rate, validated against a band
-- ----------------------------------------------------------------------------
create table public.tutor_rates (
  id           uuid primary key default gen_random_uuid(),
  tutor_id     uuid not null references public.tutors (id) on delete cascade,
  subject_id   uuid references public.subjects (id) on delete cascade,
  format       public.lesson_format not null default 'online',
  currency     text not null default 'UGX' check (char_length(currency) = 3),
  hourly_rate  numeric(12, 2) not null check (hourly_rate > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  unique (tutor_id, subject_id, format)
);

create trigger tutor_rates_set_updated_at
  before update on public.tutor_rates
  for each row execute function public.set_updated_at();

-- Enforced in the database, not just the form: a tutor cannot price outside
-- the band by posting straight to the API.
create or replace function public.enforce_rate_band()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  band record;
begin
  select * into band
  from public.rate_bands b
  where b.is_active
    and b.currency = new.currency
    and (b.subject_id is null or b.subject_id = new.subject_id)
    and (b.format is null or b.format = new.format)
  order by
    (b.subject_id is not null)::int desc,
    (b.format is not null)::int desc
  limit 1;

  -- No band configured yet: allow, so pricing can be set up incrementally.
  if band is null then
    return new;
  end if;

  if new.hourly_rate < band.min_rate or new.hourly_rate > band.max_rate then
    raise exception
      'Rate %.2f % is outside the permitted band of %.2f to %.2f',
      new.hourly_rate, new.currency, band.min_rate, band.max_rate
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger tutor_rates_enforce_band
  before insert or update on public.tutor_rates
  for each row execute function public.enforce_rate_band();

-- ----------------------------------------------------------------------------
-- commission_tiers — your cut, varying by the rate charged
-- ----------------------------------------------------------------------------
create table public.commission_tiers (
  id                    uuid primary key default gen_random_uuid(),
  currency              text not null default 'UGX' check (char_length(currency) = 3),
  min_rate              numeric(12, 2) not null check (min_rate >= 0),
  -- Null max means "and above", so the top tier needs no maintenance.
  max_rate              numeric(12, 2),
  commission_percent    numeric(5, 2) not null
                          check (commission_percent >= 0 and commission_percent <= 100),
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint commission_tiers_range_valid
    check (max_rate is null or max_rate > min_rate)
);

create trigger commission_tiers_set_updated_at
  before update on public.commission_tiers
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- bookings — a course of lessons, with the money frozen at creation
-- ----------------------------------------------------------------------------
create type public.booking_status as enum
  ('draft', 'confirmed', 'active', 'completed', 'cancelled');

create table public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  learner_id          uuid not null references public.learners (id) on delete cascade,
  tutor_id            uuid references public.tutors (id) on delete set null,
  subject_id          uuid references public.subjects (id) on delete set null,
  format              public.lesson_format not null default 'online',
  sessions_per_week   smallint not null default 1 check (sessions_per_week between 1 and 14),
  session_minutes     smallint not null default 60 check (session_minutes between 15 and 480),
  starts_on           date not null,
  ends_on             date,

  -- Frozen at booking time. Never join to tutor_rates for a historical price.
  currency            text not null default 'UGX' check (char_length(currency) = 3),
  hourly_rate         numeric(12, 2) not null check (hourly_rate > 0),
  commission_percent  numeric(5, 2) not null
                        check (commission_percent >= 0 and commission_percent <= 100),
  travel_fee          numeric(12, 2) not null default 0 check (travel_fee >= 0),

  status              public.booking_status not null default 'draft',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint bookings_dates_valid check (ends_on is null or ends_on >= starts_on)
);

create index bookings_learner_idx on public.bookings (learner_id, starts_on desc);
create index bookings_tutor_idx on public.bookings (tutor_id, status);

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- invoices + payments
-- ----------------------------------------------------------------------------
create type public.invoice_status as enum
  ('draft', 'issued', 'paid', 'partly_paid', 'void', 'overdue');

create table public.invoices (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null references public.bookings (id) on delete restrict,
  parent_id       uuid references public.profiles (id) on delete set null,
  reference       text not null unique,
  currency        text not null default 'UGX' check (char_length(currency) = 3),
  subtotal        numeric(12, 2) not null check (subtotal >= 0),
  commission      numeric(12, 2) not null default 0 check (commission >= 0),
  tutor_payout    numeric(12, 2) not null default 0 check (tutor_payout >= 0),
  total           numeric(12, 2) not null check (total >= 0),
  status          public.invoice_status not null default 'draft',
  issued_on       date,
  due_on          date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index invoices_parent_idx on public.invoices (parent_id, status, due_on);

create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

create type public.payment_status as enum
  ('pending', 'succeeded', 'failed', 'refunded');

create table public.payments (
  id            uuid primary key default gen_random_uuid(),
  invoice_id    uuid not null references public.invoices (id) on delete restrict,
  provider      text not null,
  -- Mobile money retries. This unique constraint is what makes the webhook
  -- idempotent and stops a parent being charged twice for one payment.
  provider_ref  text not null,
  currency      text not null default 'UGX' check (char_length(currency) = 3),
  amount        numeric(12, 2) not null check (amount > 0),
  status        public.payment_status not null default 'pending',
  raw_payload   jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  unique (provider, provider_ref)
);

create index payments_invoice_idx on public.payments (invoice_id, status);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row level security
-- ============================================================================
alter table public.rate_bands       enable row level security;
alter table public.tutor_rates      enable row level security;
alter table public.commission_tiers enable row level security;
alter table public.bookings         enable row level security;
alter table public.invoices         enable row level security;
alter table public.payments         enable row level security;

-- Bands are public so a tutor can see what they may charge.
create policy "Anyone reads active rate bands" on public.rate_bands for select
  to anon, authenticated using (is_active or public.is_admin());
create policy "Admins manage rate bands" on public.rate_bands for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Read tutor rates" on public.tutor_rates for select
  to anon, authenticated using (true);
create policy "Tutors set their own rates" on public.tutor_rates for insert
  to authenticated with check (public.owns_tutor(tutor_id) or public.is_admin());
create policy "Tutors update their own rates" on public.tutor_rates for update
  to authenticated using (public.owns_tutor(tutor_id) or public.is_admin())
  with check (public.owns_tutor(tutor_id) or public.is_admin());
create policy "Tutors delete their own rates" on public.tutor_rates for delete
  to authenticated using (public.owns_tutor(tutor_id) or public.is_admin());

-- Commission is between ICE and the tutor; parents never see it.
create policy "Admins manage commission tiers" on public.commission_tiers for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Parents read their bookings" on public.bookings for select
  to authenticated using (
    public.is_admin()
    or public.owns_learner(learner_id)
    or public.owns_tutor(tutor_id));
create policy "Admins manage bookings" on public.bookings for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Parents read their invoices" on public.invoices for select
  to authenticated using (public.is_admin() or parent_id = (select auth.uid()));
create policy "Admins manage invoices" on public.invoices for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- Payments are written only by the webhook via the service role.
create policy "Parents read their payments" on public.payments for select
  to authenticated using (
    public.is_admin()
    or exists (
      select 1 from public.invoices i
      where i.id = payments.invoice_id
        and i.parent_id = (select auth.uid())));

-- ============================================================================
-- Column privileges
-- ============================================================================
-- Tutors set the rate itself; everything financial downstream is admin- or
-- service-role-only. bookings.hourly_rate and commission_percent are never
-- client-writable, so a parent cannot book themselves a discount.
revoke insert, update on public.tutor_rates from anon, authenticated;
grant insert (tutor_id, subject_id, format, currency, hourly_rate)
  on public.tutor_rates to authenticated;
grant update (hourly_rate) on public.tutor_rates to authenticated;

revoke insert, update on public.bookings   from anon, authenticated;
revoke insert, update on public.invoices    from anon, authenticated;
revoke insert, update on public.payments    from anon, authenticated;
revoke insert, update on public.rate_bands  from anon, authenticated;
revoke insert, update on public.commission_tiers from anon, authenticated;
