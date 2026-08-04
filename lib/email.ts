import "server-only";

import { Resend } from "resend";
import { site, waLinks } from "@/lib/site";

/**
 * Transactional email via Resend.
 *
 * Degrades to a no-op that logs, so nothing breaks before the account exists.
 * Sending is never allowed to fail a user action: a parent whose enrolment
 * saved but whose confirmation email bounced has still enrolled, and must not
 * see an error.
 */
const apiKey = process.env.RESEND_API_KEY ?? "";
const from = process.env.RESEND_FROM ?? "ICE Tutoring <noreply@icetutoring.com>";

export const isEmailConfigured = Boolean(apiKey);

const resend = apiKey ? new Resend(apiKey) : null;

type SendResult = { sent: boolean; reason?: string };

async function send(to: string, subject: string, html: string): Promise<SendResult> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — would have sent "${subject}" to ${to}`);
    return { sent: false, reason: "not-configured" };
  }

  try {
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error("[email] send failed:", error.message);
      return { sent: false, reason: error.message };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] send threw:", err);
    return { sent: false, reason: "exception" };
  }
}

// ---------------------------------------------------------------------------
// Shared shell — inline styles only, since email clients strip <style> blocks
// ---------------------------------------------------------------------------
function shell(heading: string, bodyHtml: string, ctaLabel?: string, ctaHref?: string) {
  const cta =
    ctaLabel && ctaHref
      ? `<tr><td style="padding:8px 0 28px;">
           <a href="${ctaHref}" style="display:inline-block;background:#1560D6;color:#ffffff;
              text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;
              font-family:Segoe UI,Helvetica,Arial,sans-serif;">${ctaLabel}</a>
         </td></tr>`
      : "";

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f8fe;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f8fe;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;
                    font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0B2559;">
        <tr><td style="background:linear-gradient(100deg,#0B2559,#1560D6 60%,#34C7F4);padding:28px 32px;">
          <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">ICE Tutoring</span>
          <div style="color:#C8ECFB;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">
            Learn Today. Lead Tomorrow.
          </div>
        </td></tr>
        <tr><td style="padding:32px 32px 8px;">
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">${heading}</h1>
          ${bodyHtml}
        </td></tr>
        ${cta}
        <tr><td style="padding:0 32px 32px;border-top:1px solid #e6eefb;">
          <p style="margin:20px 0 0;font-size:13px;color:#5a6b8c;line-height:1.6;">
            Questions? Reply to this email or message us on
            <a href="${waLinks.plain}" style="color:#1560D6;">WhatsApp ${site.whatsappNumber}</a>.
          </p>
          <p style="margin:12px 0 0;font-size:12px;color:#8c99b3;">
            ${site.copyright} · ${site.location}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const p = (text: string) =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#33415c;">${text}</p>`;

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------
export function sendEnrollmentConfirmation(opts: {
  to: string;
  parentName: string;
  learnerName: string;
  classDescription: string;
  subject: string | null;
  siteUrl: string;
}) {
  return send(
    opts.to,
    `We've received your enrolment for ${opts.learnerName}`,
    shell(
      `Thank you, ${opts.parentName.split(" ")[0]}`,
      p(`We've received your enrolment for <strong>${opts.learnerName}</strong>.`) +
        p(
          `<strong>Class:</strong> ${opts.classDescription}` +
            (opts.subject ? `<br><strong>Subject:</strong> ${opts.subject}` : ""),
        ) +
        p(
          "Our team will match a tutor and confirm on WhatsApp within one business day.",
        ),
      "View your dashboard",
      `${opts.siteUrl}/account`,
    ),
  );
}

export function sendTutorApproved(opts: {
  to: string;
  tutorName: string;
  siteUrl: string;
}) {
  return send(
    opts.to,
    "Your ICE Tutoring application has been approved",
    shell(
      `Welcome to ICE, ${opts.tutorName.split(" ")[0]}`,
      p("Your tutor application has been <strong>approved</strong>.") +
        p(
          "Your profile is now live and you can be matched to learners. We'll be in touch as soon as a learner fits your subjects and availability.",
        ),
      "Open your account",
      `${opts.siteUrl}/account`,
    ),
  );
}

export function sendTutorRejected(opts: {
  to: string;
  tutorName: string;
  notes?: string | null;
}) {
  return send(
    opts.to,
    "Update on your ICE Tutoring application",
    shell(
      `Thank you for applying, ${opts.tutorName.split(" ")[0]}`,
      p(
        "After reviewing your application, we're not able to take it forward at this time.",
      ) +
        (opts.notes ? p(`<strong>Notes from our team:</strong> ${opts.notes}`) : "") +
        p(
          "We keep applications on file, so do get in touch if your qualifications or availability change.",
        ),
    ),
  );
}
