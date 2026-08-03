"use client";

import Script from "next/script";

/**
 * Cloudflare Turnstile, implicit rendering.
 *
 * The script finds any `.cf-turnstile` element and injects a hidden input
 * named `cf-turnstile-response` into the enclosing form, which the server
 * action reads back and verifies.
 */
export function TurnstileWidget({ siteKey }: { siteKey: string }) {
  return (
    <div className="mt-6 flex justify-center">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme="dark"
        data-appearance="interaction-only"
      />
    </div>
  );
}
