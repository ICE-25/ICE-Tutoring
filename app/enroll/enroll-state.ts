/**
 * Shared state shape for the enrollment action.
 *
 * Kept out of actions.ts because a "use server" module may only export
 * async functions — constants and types have to live elsewhere.
 */

export type EnrollFieldErrors = Partial<
  Record<
    "parentName" | "learnerName" | "curriculum" | "classLevel" | "subject" | "phone",
    string
  >
>;

export type EnrollState = {
  status: "idle" | "success" | "error" | "demo";
  message: string;
  fieldErrors: EnrollFieldErrors;
};

export const initialEnrollState: EnrollState = {
  status: "idle",
  message: "We'll confirm your enrollment on WhatsApp within one business day.",
  fieldErrors: {},
};
