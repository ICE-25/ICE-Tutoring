"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { AuthState } from "./auth-state";

const DEMO: AuthState = {
  status: "demo",
  message: "This is a demo form — connect it to your backend to go live.",
};

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------
export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const identifier = text(formData, "login-email");
  const password = text(formData, "login-password");

  if (!identifier || !password) {
    return { status: "error", message: "Please enter your email and password." };
  }

  // The field is labelled "Email or phone" to match the original site, but
  // phone sign-in needs an SMS provider that isn't configured yet.
  if (!EMAIL_RE.test(identifier)) {
    return {
      status: "error",
      message:
        "Phone sign-in isn't enabled yet — please sign in with your email address.",
    };
  }

  if (!isSupabaseConfigured) return DEMO;

  const supabase = await createClient();
  if (!supabase) return DEMO;

  const { error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  });

  if (error) {
    // Deliberately vague: don't reveal whether the address is registered.
    return { status: "error", message: "That email and password don't match. Please try again." };
  }

  revalidatePath("/account", "layout");
  redirect("/account");
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = text(formData, "reg-name");
  const email = text(formData, "reg-email");
  const phone = text(formData, "reg-phone");
  const password = text(formData, "reg-password");

  if (fullName.length < 2) {
    return { status: "error", message: "Please enter your full name." };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { status: "error", message: "Please choose a password of at least 8 characters." };
  }

  if (!isSupabaseConfigured) return DEMO;

  const supabase = await createClient();
  if (!supabase) return DEMO;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Read by the handle_new_user() trigger to populate public.profiles.
      data: { full_name: fullName, phone },
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  // With email confirmation enabled (the Supabase default) there is no session
  // until the user clicks the link in their inbox.
  if (!data.session) {
    return {
      status: "check-email",
      message: `Almost there — we sent a confirmation link to ${email}. Click it to activate your account.`,
    };
  }

  revalidatePath("/account", "layout");
  redirect("/account");
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------
export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();

  revalidatePath("/account", "layout");
  redirect("/account");
}
