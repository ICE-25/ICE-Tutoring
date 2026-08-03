/**
 * Shared state shape for the auth actions.
 *
 * Kept out of actions.ts because a "use server" module may only export
 * async functions — constants and types have to live elsewhere.
 */

export type AuthState = {
  status: "idle" | "error" | "demo" | "check-email";
  message: string;
};

export const initialLoginState: AuthState = {
  status: "idle",
  message: "Forgot your password? Message us on WhatsApp to reset it.",
};

export const initialRegisterState: AuthState = {
  status: "idle",
  message: "By registering you agree to be contacted about your lessons.",
};
