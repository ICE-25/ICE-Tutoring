"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, ShieldCheck, X } from "lucide-react";
import { navLinks } from "@/lib/site";
import { LinkButton } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Account = { name: string; email: string; isAdmin: boolean };

/** Initials for the avatar chip, e.g. "David Aine" -> "DA". */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const reduce = useReducedMotion();

  /**
   * Resolved on the client so the marketing pages stay statically rendered —
   * reading the session in the root layout would force every page dynamic.
   */
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    let active = true;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;
      if (!user) {
        setAccount(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      setAccount({
        name: profile?.full_name || user.email || "Account",
        email: user.email ?? "",
        isAdmin: profile?.role === "admin",
      });
    };

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-[100] transition-all duration-500",
        scrolled
          ? "border-b border-white/10 bg-void/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="container-ice flex items-center justify-between py-4" aria-label="Main">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative">
            <span
              aria-hidden
              className="absolute -inset-1 rounded-xl bg-cyan-brand/30 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"
            />
            <Image
              src="/assets/logo-icon.png"
              alt="ICE Tutoring logo"
              width={44}
              height={44}
              priority
              className="relative rounded-xl ring-1 ring-white/15"
            />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            ICE <span className="text-grad">Tutoring</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 font-display text-[0.9rem] font-medium transition-colors duration-300",
                    active ? "text-white" : "text-slate-400 hover:text-white",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full border border-cyan-brand/40 bg-cyan-brand/10 shadow-[0_0_20px_-6px_rgba(52,199,244,0.9)]"
                      transition={{ duration: reduce ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {account ? (
            <>
              {account.isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 font-display text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  Admin
                </Link>
              )}
              <Link
                href="/account"
                title={account.email}
                className="group flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] py-1.5 pl-1.5 pr-4 transition-all hover:border-cyan-brand/50"
              >
                <span
                  aria-hidden
                  className="grid h-9 w-9 place-items-center rounded-full bg-grad-brand font-display text-xs font-bold text-white shadow-[0_0_16px_-4px_rgba(52,199,244,0.9)]"
                >
                  {initials(account.name)}
                </span>
                <span className="max-w-[10rem] truncate font-display text-sm font-medium text-white">
                  {account.name}
                </span>
              </Link>
            </>
          ) : (
            <>
              <LinkButton href="/account" variant="ghost">
                Log in
              </LinkButton>
              <LinkButton href="/enroll" variant="primary">
                Join Now
              </LinkButton>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/5 text-white transition-colors hover:border-cyan-brand/50 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/10 bg-void/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="container-ice flex flex-col py-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={cn(
                      "block border-b border-white/5 py-3.5 font-display text-base font-medium transition-colors",
                      pathname === link.href ? "text-cyan-brand" : "text-slate-300 hover:text-white",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="container-ice flex flex-col gap-3 pb-6">
              {account ? (
                <>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.04] p-3">
                    <span
                      aria-hidden
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-grad-brand font-display text-xs font-bold text-white"
                    >
                      {initials(account.name)}
                    </span>
                    <span className="min-w-0">
                      <strong className="block truncate font-display text-sm text-white">
                        {account.name}
                      </strong>
                      <span className="block truncate text-xs text-slate-400">
                        {account.email}
                      </span>
                    </span>
                  </div>
                  {account.isAdmin && (
                    <LinkButton href="/admin" variant="ghost" block>
                      Admin console
                    </LinkButton>
                  )}
                  <LinkButton href="/account" variant="primary" block>
                    My dashboard
                  </LinkButton>
                </>
              ) : (
                <>
                  <LinkButton href="/account" variant="ghost" block>
                    Log in
                  </LinkButton>
                  <LinkButton href="/enroll" variant="primary" block>
                    Join Now
                  </LinkButton>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
