"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { TextField } from "./Field";
import { cn } from "@/lib/utils";

const DEMO_NOTE = "This is a demo form — connect it to your backend to go live.";
const LOGIN_NOTE = "Forgot your password? Message us on WhatsApp to reset it.";
const REGISTER_NOTE = "By registering you agree to be contacted about your lessons.";

type Tab = "login" | "register";

export function AccountForm() {
  const [tab, setTab] = useState<Tab>("login");
  const [loginNote, setLoginNote] = useState(LOGIN_NOTE);
  const [registerNote, setRegisterNote] = useState(REGISTER_NOTE);
  const reduce = useReducedMotion();

  const tabs: { id: Tab; label: string }[] = [
    { id: "login", label: "Log in" },
    { id: "register", label: "Register" },
  ];

  return (
    <div className="edge-glow glass-strong relative mx-auto max-w-lg rounded-hud-lg p-8 shadow-card sm:p-10">
      <span aria-hidden className="aura -top-16 left-1/2 h-40 w-64 -translate-x-1/2 bg-cyan-brand/20" />

      <div className="relative">
        {/* Tab switcher */}
        <div role="tablist" aria-label="Account" className="mb-8 flex gap-1.5 rounded-full border border-white/10 bg-white/[0.03] p-1.5">
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

        {/* Log in */}
        <form
          role="tabpanel"
          id="panel-login"
          aria-labelledby="tab-login"
          hidden={tab !== "login"}
          onSubmit={(e) => {
            e.preventDefault();
            setLoginNote(DEMO_NOTE);
          }}
        >
          <div className="space-y-5">
            <TextField
              id="login-email"
              label="Email or phone"
              placeholder="you@example.com"
              autoComplete="username"
              required
            />
            <TextField
              id="login-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="mt-8">
            <Button type="submit" variant="primary" size="lg" block>
              Log in
            </Button>
          </div>
          <p aria-live="polite" className="mt-5 text-center text-sm text-slate-400">
            {loginNote}
          </p>
        </form>

        {/* Register */}
        <form
          role="tabpanel"
          id="panel-register"
          aria-labelledby="tab-register"
          hidden={tab !== "register"}
          onSubmit={(e) => {
            e.preventDefault();
            setRegisterNote(DEMO_NOTE);
          }}
        >
          <div className="space-y-5">
            <TextField id="reg-name" label="Full name" placeholder="Your name" autoComplete="name" required />
            <TextField
              id="reg-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <TextField
              id="reg-phone"
              label="Phone number"
              type="tel"
              placeholder="07XX XXX XXX"
              autoComplete="tel"
              required
            />
            <TextField
              id="reg-password"
              label="Create password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="mt-8">
            <Button type="submit" variant="primary" size="lg" block>
              Create account
            </Button>
          </div>
          <p aria-live="polite" className="mt-5 text-center text-sm text-slate-400">
            {registerNote}
          </p>
        </form>
      </div>
    </div>
  );
}
