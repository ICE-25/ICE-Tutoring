"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/site";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

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
          <LinkButton href="/account" variant="ghost">
            Log in
          </LinkButton>
          <LinkButton href="/enroll" variant="primary">
            Join Now
          </LinkButton>
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
              <LinkButton href="/account" variant="ghost" block>
                Log in
              </LinkButton>
              <LinkButton href="/enroll" variant="primary" block>
                Join Now
              </LinkButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
