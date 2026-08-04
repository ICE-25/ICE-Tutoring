import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Sessionless anon client for public reference data.
 *
 * The cookie-scoped server client forces a route to render dynamically,
 * because reading cookies opts out of static generation. Reference data
 * (curricula, class levels, subjects) is identical for every visitor, so
 * fetching it without cookies lets those pages be cached and served
 * instantly instead of hitting the database on every request.
 */
export function createPublicClient() {
  if (!isSupabaseConfigured) return null;

  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
