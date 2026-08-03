/**
 * Cloudflare Turnstile verification.
 *
 * Until real keys are supplied we fall back to Cloudflare's official test
 * keys, which always pass. That lets the whole flow be built and tested
 * without anyone handling a secret. Swap in real keys at deploy time:
 *
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY=...   (public, ships in the browser)
 *   TURNSTILE_SECRET_KEY=...             (server only — never NEXT_PUBLIC_)
 */

/** Cloudflare's documented "always passes" pair. */
const TEST_SITE_KEY = "1x00000000000000000000AA";
const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TEST_SITE_KEY;

/** True once real keys are in place — used to warn in logs, not to skip checks. */
export const isTurnstileLive = Boolean(
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY,
);

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult = { ok: true } | { ok: false; reason: string };

export async function verifyTurnstile(
  token: string | null,
  remoteIp?: string,
): Promise<TurnstileResult> {
  if (!token) return { ok: false, reason: "missing-token" };

  const secret = process.env.TURNSTILE_SECRET_KEY || TEST_SECRET_KEY;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      // Never cache a challenge verification.
      cache: "no-store",
    });

    if (!res.ok) return { ok: false, reason: `siteverify-http-${res.status}` };

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      return { ok: false, reason: data["error-codes"]?.join(",") || "rejected" };
    }

    return { ok: true };
  } catch (err) {
    // Fail closed: if we cannot verify, we do not accept the submission.
    console.error("Turnstile verification failed:", err);
    return { ok: false, reason: "verify-unreachable" };
  }
}
