"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";
import { waLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

const GREETING =
  "Hi! I'm ICE Bot 👋 I can help with subjects, grades, pricing, or class formats. What would you like to know?";

const FALLBACK = "Let's continue this on WhatsApp so a tutor can help directly.";

/** Quick replies and responses carried over verbatim from js/main.js. */
const quickReplies = [
  {
    id: "subjects",
    chip: "Which subjects do you teach?",
    reply:
      "We tutor Maths, Sciences, English, French, Coding, Robotics and more — for Primary through Upper Secondary. Which subject is your child working on?",
  },
  {
    id: "pricing",
    chip: "How much does tutoring cost?",
    reply:
      "Pricing depends on one-to-one vs group classes and how many sessions a week. Our team on WhatsApp can share a plan that fits your budget.",
  },
  {
    id: "online",
    chip: "Online or physical classes?",
    reply:
      "Yes — we run both online and physical lessons, so your child can learn from home or in person, whichever works best.",
  },
  {
    id: "talk",
    chip: "I want to talk to a tutor",
    reply:
      "Great — tap 'Continue on WhatsApp' below and one of our tutors will pick up the conversation right away.",
  },
] as const;

type Message = { id: number; from: "bot" | "user"; text: string };

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "bot", text: GREETING },
  ]);
  const [typing, setTyping] = useState(false);
  const [used, setUsed] = useState<string[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();

  // Keep the newest message in view.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function send(chip: string, reply: string, id: string) {
    if (typing) return;
    setUsed((u) => (u.includes(id) ? u : [...u, id]));
    setMessages((m) => [...m, { id: nextId.current++, from: "user", text: chip }]);
    setTyping(true);

    timer.current = setTimeout(
      () => {
        setTyping(false);
        setMessages((m) => [...m, { id: nextId.current++, from: "bot", text: reply || FALLBACK }]);
      },
      reduce ? 120 : 750,
    );
  }

  return (
    <div className="edge-glow glass-strong relative mx-auto max-w-xl overflow-hidden rounded-hud-lg shadow-glow-lg">
      {/* Header */}
      <div className="relative flex items-center gap-3.5 overflow-hidden bg-grad-brand px-6 py-5">
        <span aria-hidden className="absolute inset-0 grid-floor opacity-30" />
        <Image
          src="/assets/mascot-chat.png"
          alt="ICE Bot avatar"
          width={48}
          height={48}
          className="relative h-12 w-12 rounded-full object-cover ring-2 ring-white/40"
        />
        <div className="relative">
          <strong className="block font-display text-base font-semibold text-white">ICE Bot</strong>
          <span className="flex items-center gap-2 text-xs text-white/80">
            <span
              aria-hidden
              className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-whatsapp-bright shadow-[0_0_8px_2px_rgba(52,245,140,0.8)]"
            />
            Online now
          </span>
        </div>
      </div>

      {/* Transcript */}
      <div
        ref={bodyRef}
        role="log"
        aria-live="polite"
        aria-label="Chat with ICE Bot"
        className="flex max-h-[22rem] min-h-[16rem] flex-col gap-3 overflow-y-auto bg-abyss/60 p-6"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: reduce ? 0 : 10, scale: reduce ? 1 : 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: reduce ? 0.1 : 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-[0.94rem] leading-relaxed",
                m.from === "bot"
                  ? "self-start rounded-bl-md border border-white/10 bg-white/[0.06] text-slate-200"
                  : "self-end rounded-br-md bg-grad-brand text-white shadow-[0_10px_28px_-14px_rgba(52,199,244,0.9)]",
              )}
            >
              {m.text}
            </motion.div>
          ))}

          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="self-start rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-3.5"
            >
              <span className="sr-only">ICE Bot is typing</span>
              <span className="flex gap-1.5" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-cyan-brand"
                    style={{ animationDelay: `${i * 0.18}s` }}
                  />
                ))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick replies */}
      <div className="flex flex-wrap gap-2.5 bg-abyss/60 px-6 pb-6">
        {quickReplies.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => send(q.chip, q.reply, q.id)}
            disabled={typing}
            className={cn(
              "rounded-full border px-4 py-2 text-[0.83rem] font-medium transition-all duration-300",
              "disabled:cursor-not-allowed disabled:opacity-50",
              used.includes(q.id)
                ? "border-white/10 bg-white/[0.02] text-slate-500"
                : "border-cyan-brand/30 bg-cyan-brand/10 text-cyan-glow hover:border-cyan-brand/70 hover:bg-cyan-brand/20 hover:shadow-[0_0_20px_-6px_rgba(52,199,244,0.9)]",
            )}
          >
            {q.chip}
          </button>
        ))}
      </div>

      {/* Handoff */}
      <div className="border-t border-white/10 bg-white/[0.02] p-6">
        <LinkButton href={waLinks.continueChat} variant="whatsapp" size="lg" block external>
          Continue on WhatsApp
        </LinkButton>
      </div>
    </div>
  );
}
