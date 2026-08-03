"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MessageState } from "./message-state";

/**
 * Sends a message from the signed-in parent to the ICE team.
 *
 * The thread is created lazily on first send. Note that RLS independently
 * enforces both halves of this: a sender may only post as themselves
 * (sender_id = auth.uid()) and only into a conversation they own.
 */
export async function sendMessage(
  _prev: MessageState,
  formData: FormData,
): Promise<MessageState> {
  const raw = formData.get("body");
  const body = typeof raw === "string" ? raw.trim() : "";

  if (!body) {
    return { status: "error", message: "Type a message first." };
  }
  if (body.length > 4000) {
    return { status: "error", message: "That message is too long (4000 characters max)." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { status: "error", message: "Messaging isn't available right now." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Please sign in again to send a message." };
  }

  // Reuse the parent's existing thread, or open one.
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("parent_id", user.id)
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let conversationId = existing?.id;

  if (!conversationId) {
    const { data: created, error: convError } = await supabase
      .from("conversations")
      .insert({ parent_id: user.id, subject: "General enquiry" })
      .select("id")
      .single();

    if (convError || !created) {
      console.error("Could not open conversation:", convError?.message);
      return { status: "error", message: "Couldn't open a conversation. Please try again." };
    }
    conversationId = created.id;
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body,
  });

  if (error) {
    console.error("Message send failed:", error.message);
    return { status: "error", message: "Couldn't send that message. Please try again." };
  }

  revalidatePath("/account");
  return { status: "sent", message: "" };
}
