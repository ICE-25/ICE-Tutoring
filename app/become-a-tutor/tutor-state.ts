/** Shared state for the tutor application action. */
export type TutorApplyState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialTutorApplyState: TutorApplyState = {
  status: "idle",
  message: "",
};
