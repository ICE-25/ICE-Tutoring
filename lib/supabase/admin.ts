import { redirect } from "next/navigation";
import { createClient } from "./server";

/**
 * Gate for every /admin route.
 *
 * The database is the authority — this only decides what UI to render.
 * Even if this check were bypassed, every admin write is independently
 * gated by an RLS policy calling is_admin(), so a non-admin session
 * reaching these pages still could not write anything.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) redirect("/account");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/account");

  return { supabase, user, profile };
}
