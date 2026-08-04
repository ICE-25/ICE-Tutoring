/**
 * Absolute base URL for links inside emails.
 *
 * Emails are read outside the app, so relative paths are useless. Vercel sets
 * VERCEL_PROJECT_PRODUCTION_URL on deployments; NEXT_PUBLIC_SITE_URL overrides
 * it once a custom domain is live.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
