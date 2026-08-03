"use client";

import { useActionState, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, MailCheck, TriangleAlert } from "lucide-react";
import { signIn, signUp } from "@/app/account/actions";
import { initialLoginState, initialRegisterState } from "@/app/account/auth-state";
import { Button } from "@/components/ui/Button";
import { TextField } from "./Field";
import { cn } from "@/lib/utils";

type Tab = "login" | "register";

function StatusNote({ status, message }: { status: string; message: string }) {
  const isError = status === "error";
  const isCheckEmail = status === "check-email";

  return (
    <p
      aria-live="polite"
      className={cn(
        "mt-5 flex items-center justify-center gap-2 text-center text-sm",
        isError && "text-rose-300",
        isCheckEmail && "text-whatsapp-bright",
        !isError && !isCheckEmail && "text-slate-400",
      )}
    >
      {isError && <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />}
      {isCheckEmail && <MailCheck className="h-4 w-4 shrink-0" aria-hidden />}
      {message}
    </p>
  );
}

export function AccountForm() {
  const [tab, setTab] = useState<Tab>("login");
  const reduce = useReducedMotion();

  // Controlled: React resets uncontrolled forms once a server action settles,
  // which would wipe everything the user typed on a failed sign-in.
  const [login, setLogin] = useState({ email: "", password: "" });
  const [register, setRegister] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loginState, loginAction, loginPending] = useActionState(signIn, initialLoginState);
  const [registerState, registerAction, registerPending] = useActionState(
    signUp,
    initialRegisterState,
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "login", label: "Log in" },
    { id: "register", label: "Register" },
  ];

  return (
    <div className="edge-glow glass-strong relative mx-auto max-w-lg rounded-hud-lg p-8 shadow-card sm:p-10">
      <span aria-hidden className="aura -top-16 left-1/2 h-40 w-64 -translate-x-1/2 bg-cyan-brand/20" />

      <div className="relative">
        <div
          role="tablist"
          aria-label="Account"
          className="mb-8 flex gap-1.5 rounded-full border border-white/10 bg-white/[0.03] p-1.5"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex-1 rounded-full px-4 py-2.5 font-display text-sm font-semibold transition-colors duration-300",
                tab === t.id ? "text-white" : "text-slate-400 hover:text-slate-200",
              )}
            >
              {tab === t.id && (
                <motion.span
                  layoutId="account-tab"
                  className="absolute inset-0 rounded-full bg-grad-brand shadow-[0_0_22px_-6px_rgba(52,199,244,0.9)]"
                  transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ---------------- Log in ---------------- */}
        <form
          role="tabpanel"
          id="panel-login"
          aria-labelledby="tab-login"
          hidden={tab !== "login"}
          action={loginAction}
        >
          <div className="space-y-5">
            <TextField
              id="login-email"
              label="Email or phone"
              placeholder="you@example.com"
              autoComplete="username"
              required
              value={login.email}
              onChange={(v) => setLogin((p) => ({ ...p, email: v }))}
            />
            <TextField
              id="login-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={login.password}
              onChange={(v) => setLogin((p) => ({ ...p, password: v }))}
            />
          </div>
          <div className="mt-8">
            <Button type="submit" variant="primary" size="lg" block disabled={loginPending}>
              {loginPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Signing in…
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </div>
          <StatusNote status={loginState.status} message={loginState.message} />
        </form>

        {/* ---------------- Register ---------------- */}
        <form
          role="tabpanel"
          id="panel-register"
          aria-labelledby="tab-register"
          hidden={tab !== "register"}
          action={registerAction}
        >
          <div className="space-y-5">
            <TextField
              id="reg-name"
              label="Full name"
              placeholder="Your name"
              autoComplete="name"
              required
              value={register.name}
              onChange={(v) => setRegister((p) => ({ ...p, name: v }))}
            />
            <TextField
              id="reg-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={register.email}
              onChange={(v) => setRegister((p) => ({ ...p, email: v }))}
            />
            <TextField
              id="reg-phone"
              label="Phone number"
              type="tel"
              placeholder="07XX XXX XXX"
              autoComplete="tel"
              required
              value={register.phone}
              onChange={(v) => setRegister((p) => ({ ...p, phone: v }))}
            />
            <TextField
              id="reg-password"
              label="Create password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
              value={register.password}
              onChange={(v) => setRegister((p) => ({ ...p, password: v }))}
            />
          </div>
          <div className="mt-8">
            <Button type="submit" variant="primary" size="lg" block disabled={registerPending}>
              {registerPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </div>
          <StatusNote status={registerState.status} message={registerState.message} />
        </form>
      </div>
    </div>
  );
}
