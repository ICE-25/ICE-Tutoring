"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Send, TriangleAlert } from "lucide-react";
import { sendMessage } from "@/app/account/message-actions";
import { initialMessageState } from "@/app/account/message-state";
import { cn } from "@/lib/utils";

export type ThreadMessage = {
  id: string;
  body: string;
  created_at: string;
  mine: boolean;
};

export function MessageThread({ messages }: { messages: ThreadMessage[] }) {
  const [state, formAction, pending] = useActionState(sendMessage, initialMessageState);
  const formRef = useRef<HTMLFormElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Clear the box once a message lands, and keep the newest in view.
  useEffect(() => {
    if (state.status === "sent") formRef.current?.reset();
  }, [state]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <div className="edge-glow glass overflow-hidden rounded-hud">
      <div
        ref={listRef}
        role="log"
        aria-label="Conversation with the ICE team"
        className="flex max-h-[24rem] min-h-[12rem] flex-col gap-3 overflow-y-auto p-6"
      >
        {messages.length === 0 ? (
          <p className="m-auto max-w-sm text-center text-sm text-slate-400">
            No messages yet. Ask about lessons, scheduling or progress — the ICE team
            replies here.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[82%] rounded-2xl px-4 py-3 text-[0.94rem] leading-relaxed",
                m.mine
                  ? "self-end rounded-br-md bg-grad-brand text-white"
                  : "self-start rounded-bl-md border border-white/10 bg-white/[0.06] text-slate-200",
              )}
            >
              {m.body}
              <time
                dateTime={m.created_at}
                className="mt-1.5 block text-[0.68rem] opacity-60"
              >
                {new Date(m.created_at).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
          ))
        )}
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="flex items-end gap-3 border-t border-white/10 bg-white/[0.02] p-4"
      >
        <label htmlFor="body" className="sr-only">
          Your message
        </label>
        <textarea
          id="body"
          name="body"
          rows={2}
          required
          maxLength={4000}
          placeholder="Type a message to the ICE team…"
          className="min-h-[3rem] flex-1 resize-y rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-[0.95rem] text-white placeholder:text-slate-500 transition-all hover:border-white/25 focus:border-cyan-brand/70 focus:outline-none focus:ring-2 focus:ring-cyan-brand/25"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary shrink-0 !px-5 !py-3 disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
          <span className="sr-only sm:not-sr-only">Send</span>
        </button>
      </form>

      {state.status === "error" && (
        <p
          aria-live="polite"
          className="flex items-center gap-2 border-t border-white/10 px-4 py-3 text-sm text-rose-300"
        >
          <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
          {state.message}
        </p>
      )}
    </div>
  );
}
