/** Shared state for the parent↔ICE message thread. */
export type MessageState = {
  status: "idle" | "sent" | "error";
  message: string;
};

export const initialMessageState: MessageState = { status: "idle", message: "" };
