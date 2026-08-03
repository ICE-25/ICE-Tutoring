"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Browser-side Supabase client. Returns null when the project has not been
 * configured yet, so callers must handle the unconfigured case explicitly
 * rather than crashing on a missing URL.
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
