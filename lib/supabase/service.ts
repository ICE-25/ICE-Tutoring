import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { SUPABASE_URL } from "./config";

/**
 * Service-role client. BYPASSES ROW LEVEL SECURITY ENTIRELY.
 *
 * The `server-only` import above makes the build fail if this module is ever
 * pulled into a client bundle, and the key deliberately has no NEXT_PUBLIC_
 * prefix so Next will never inline it into browser JavaScript.
 *
 * Only legitimate use today: writing an enrollment after Turnstile and the
 * rate limit have both passed. That lets us revoke anonymous INSERT on
 * `enrollments`, which is what actually closes the bypass — otherwise anyone
 * holding the public anon key can POST straight to PostgREST and skip every
 * check this app performs.
 *
 * Never use it to read data on behalf of a user; RLS is the only thing
 * separating one parent's children from another's.
 */
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const hasServiceRole = Boolean(serviceKey && SUPABASE_URL);

export function createServiceClient() {
  if (!hasServiceRole) return null;

  return createSupabaseClient<Database>(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
