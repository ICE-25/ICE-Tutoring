/** Shared result shape for admin form actions. Kept out of the "use server"
 *  module, which may only export async functions. */
export type AdminState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialAdminState: AdminState = { status: "idle", message: "" };
