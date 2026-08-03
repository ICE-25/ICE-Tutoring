"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { initialAdminState, type AdminState } from "@/app/admin/admin-state";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function AdminForm({
  action,
  submitLabel,
  children,
}: {
  action: (prev: AdminState, fd: FormData) => Promise<AdminState>;
  submitLabel: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, initialAdminState);

  return (
    <form action={formAction} className="edge-glow glass rounded-hud p-7">
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </Button>

        {state.message && (
          <p
            aria-live="polite"
            className={cn(
              "flex items-center gap-2 text-sm",
              state.status === "error" ? "text-rose-300" : "text-whatsapp-bright",
            )}
          >
            {state.status === "error" ? (
              <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
            )}
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
