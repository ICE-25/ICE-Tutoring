/**
 * Shared site metadata, navigation and contact details.
 * All values are carried over verbatim from the original static site.
 */

export const site = {
  name: "ICE Tutoring",
  parentBrand: "Immaculate Child Education",
  tagline: "Learn Today. Lead Tomorrow.",
  blurb:
    "Quality education, anywhere, anytime. A tutoring brand under Immaculate Child Education.",
  motto: ["Discipline", "Consistency", "Excellence", "Success"],
  copyright: "© 2026 ICE Tutoring · Immaculate Child Education",
  promise: "We don't just teach, we transform and inspire.",
  whatsappNumber: "+256 778 279 107",
  phoneNumber: "+256 702 278 216",
  phoneHref: "tel:+256702278216",
  location: "Kampala, Uganda",
} as const;

/** Builds a wa.me deep link with a pre-filled message. */
export function whatsapp(message?: string) {
  const base = "https://wa.me/256778279107";
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** The exact pre-filled WhatsApp messages used across the original pages. */
export const waLinks = {
  knowMore: whatsapp("Hi ICE Tutoring, I'd like to know more"),
  chooseSubject: whatsapp("Hi ICE Tutoring, I'd like help choosing a subject"),
  matchTutor: whatsapp("Hi ICE Tutoring, I'd like to be matched with a tutor"),
  enrollChild: whatsapp("Hi ICE Tutoring, I'd like to enroll my child"),
  continueChat: whatsapp("Hi ICE Bot, I'd like to continue our chat with a tutor"),
  plain: whatsapp(),
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Subjects", href: "/subjects" },
  { label: "Tutors", href: "/tutors" },
  { label: "Enroll", href: "/enroll" },
  // The supply side needs a top-level entry point, not just a footer link.
  { label: "Teach", href: "/become-a-tutor" },
  { label: "ICE Bot", href: "/ice-bot" },
  { label: "Account", href: "/account" },
] as const;

export const footerColumns = [
  {
    title: "Explore",
    links: [
      { label: "Subjects", href: "/subjects" },
      { label: "Tutors", href: "/tutors" },
      { label: "Enroll", href: "/enroll" },
      { label: "ICE Bot", href: "/ice-bot" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/account" },
      { label: "Register", href: "/account" },
      { label: "Become a tutor", href: "/become-a-tutor" },
    ],
  },
] as const;
