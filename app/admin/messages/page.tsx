import { replyToConversation } from "../actions";
import { requireAdmin } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

export default async function AdminMessagesPage() {
  const { supabase, user } = await requireAdmin();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, parent_id, subject, last_message_at")
    .order("last_message_at", { ascending: false });

  if (!conversations?.length) {
    return (
      <div className="glass rounded-hud p-10 text-center text-slate-400">
        No conversations yet. Threads appear here when a parent sends a message from
        their dashboard.
      </div>
    );
  }

  const [{ data: profiles }, { data: allMessages }] = await Promise.all([
    supabase.from("profiles").select("id, full_name"),
    supabase
      .from("messages")
      .select("id, conversation_id, sender_id, body, created_at")
      .in(
        "conversation_id",
        conversations.map((c) => c.id),
      )
      .order("created_at", { ascending: true }),
  ]);

  const parentName = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (
    <div className="space-y-8">
      {conversations.map((c) => {
        const thread = (allMessages ?? []).filter((m) => m.conversation_id === c.id);

        return (
          <div key={c.id} className="edge-glow glass overflow-hidden rounded-hud">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
              <strong className="font-display text-white">
                {parentName.get(c.parent_id) || "Unknown parent"}
              </strong>
              <span className="font-hud text-[0.68rem] uppercase tracking-[0.16em] text-slate-500">
                {new Date(c.last_message_at).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex max-h-80 flex-col gap-3 overflow-y-auto p-6">
              {thread.map((m) => {
                const fromAdmin = m.sender_id === user.id;
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[82%] rounded-2xl px-4 py-3 text-[0.92rem] leading-relaxed",
                      fromAdmin
                        ? "self-end rounded-br-md bg-grad-brand text-white"
                        : "self-start rounded-bl-md border border-white/10 bg-white/[0.06] text-slate-200",
                    )}
                  >
                    {m.body}
                  </div>
                );
              })}
            </div>

            <form
              action={replyToConversation}
              className="flex items-end gap-3 border-t border-white/10 bg-white/[0.02] p-4"
            >
              <input type="hidden" name="conversation_id" value={c.id} />
              <label htmlFor={`reply-${c.id}`} className="sr-only">
                Reply to {parentName.get(c.parent_id) || "parent"}
              </label>
              <textarea
                id={`reply-${c.id}`}
                name="body"
                rows={2}
                required
                maxLength={4000}
                placeholder="Reply…"
                className="flex-1 resize-y rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-[0.95rem] text-white placeholder:text-slate-500 focus:border-cyan-brand/70 focus:outline-none focus:ring-2 focus:ring-cyan-brand/25"
              />
              <button type="submit" className="btn btn-primary shrink-0 !px-5 !py-3">
                Send
              </button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
