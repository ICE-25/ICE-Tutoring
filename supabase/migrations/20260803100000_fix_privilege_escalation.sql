-- ============================================================================
-- SECURITY FIX — self-service privilege escalation via profiles.role
-- ============================================================================
-- Found by test: a signed-in parent could PATCH their own profiles row with
-- {"role":"admin"}. The "Users update their own profile" policy permitted it
-- because RLS policies gate WHICH ROWS may be written, not WHICH COLUMNS.
-- is_admin() then returned true, exposing every enrollment in the database
-- (parent names, learner names, phone numbers) plus update/delete rights.
--
-- Column-level privileges are the correct tool. Revoke blanket INSERT/UPDATE
-- and re-grant only the columns a user is allowed to set on themselves.
-- service_role is untouched, so server-side admin tooling still works.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles: role is no longer user-writable
-- ---------------------------------------------------------------------------
revoke insert, update on public.profiles from anon, authenticated;

grant insert (id, full_name, phone) on public.profiles to authenticated;
grant update (full_name, phone)     on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- enrollments: submitters must not be able to set their own triage status
-- ---------------------------------------------------------------------------
revoke insert on public.enrollments from anon, authenticated;

grant insert (
  parent_id, learner_id, parent_name, learner_name, grade_band, subject, phone
) on public.enrollments to anon, authenticated;

-- ---------------------------------------------------------------------------
-- learners: id and parent_id are set once, never rewritten
-- ---------------------------------------------------------------------------
revoke update on public.learners from anon, authenticated;

grant update (full_name, grade_band) on public.learners to authenticated;

-- ---------------------------------------------------------------------------
-- Undo the escalation performed during testing.
-- Targeted at the known test account rather than a blanket role reset, so a
-- legitimately-granted admin is never silently demoted.
-- ---------------------------------------------------------------------------
update public.profiles
set role = 'parent'
where id = '8aecbede-bb8e-48dc-a2ee-4ef150840a49'
  and role = 'admin';

-- NOTE: admins must now be promoted from the SQL editor or with the
-- service_role key. That is the intended workflow — there is deliberately no
-- path for a client-side session to grant itself the admin role.
