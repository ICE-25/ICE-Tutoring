import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { footerColumns, site, waLinks } from "@/lib/site";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-abyss pt-20">
      <span aria-hidden className="absolute inset-0 grid-floor opacity-40 mask-fade-b" />
      <span
        aria-hidden
        className="aura -top-40 left-1/2 h-80 w-[44rem] -translate-x-1/2 bg-blue-brand/15"
      />

      <div className="container-ice relative">
        <div className="grid gap-12 pb-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" className="mb-5 flex items-center gap-3">
              <Image
                src="/assets/logo-icon.png"
                alt="ICE Tutoring logo"
                width={44}
                height={44}
                className="rounded-xl ring-1 ring-white/15"
              />
              <span className="font-display text-lg font-bold text-white">ICE Tutoring</span>
            </Link>
            <p className="max-w-xs text-[0.95rem] text-slate-400">{site.blurb}</p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-5 font-hud text-[0.72rem] uppercase tracking-[0.22em] text-cyan-brand">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[0.95rem] text-slate-400 transition-colors hover:text-cyan-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-5 font-hud text-[0.72rem] uppercase tracking-[0.22em] text-cyan-brand">
              Get in touch
            </h4>
            <ul className="space-y-3.5 text-[0.95rem] text-slate-400">
              <li>
                <a
                  href={waLinks.plain}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 transition-colors hover:text-cyan-brand"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-whatsapp" aria-hidden />
                  WhatsApp: {site.whatsappNumber}
                </a>
              </li>
              <li>
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center gap-2.5 transition-colors hover:text-cyan-brand"
                >
                  <Phone className="h-4 w-4 shrink-0 text-cyan-brand" aria-hidden />
                  Call: {site.phoneNumber}
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-cyan-brand" aria-hidden />
                {site.location}
              </li>
            </ul>
          </div>
        </div>

        {/* Motto rail */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/10 py-7">
          {site.motto.map((word, i) => (
            <span key={word} className="flex items-center gap-4">
              <span className="font-hud text-[0.72rem] uppercase tracking-[0.28em] text-slate-400">
                {word}
              </span>
              {i < site.motto.length - 1 && (
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-cyan-brand shadow-[0_0_10px_2px_rgba(52,199,244,0.7)]"
                />
              )}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-7 text-center text-[0.82rem] text-slate-500 sm:flex-row sm:justify-between sm:text-left">
          <span>{site.copyright}</span>
          <span>{site.promise}</span>
        </div>
      </div>
    </footer>
  );
}
