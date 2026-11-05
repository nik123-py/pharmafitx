/**
 * Business contact details. All values come from environment variables so the
 * owner can change them in Vercel without touching code. Empty values are hidden
 * in the UI — never replace them with made-up placeholders.
 *
 * NEXT_PUBLIC_* values are inlined into the client bundle at build time; they are
 * public contact details, not secrets.
 */

function clean(v: string | undefined) {
  return (v ?? "").trim();
}

/** Digits only, international format without "+", e.g. 919876543210. */
export function normaliseWhatsAppNumber(raw: string | undefined) {
  return clean(raw).replace(/[^\d]/g, "");
}

export const businessConfig = {
  companyName: clean(process.env.NEXT_PUBLIC_COMPANY_NAME) || "Pharmafitx",
  email: clean(process.env.NEXT_PUBLIC_BUSINESS_EMAIL),
  phone: clean(process.env.NEXT_PUBLIC_BUSINESS_PHONE),
  address: clean(process.env.NEXT_PUBLIC_BUSINESS_ADDRESS),
  hours: clean(process.env.NEXT_PUBLIC_BUSINESS_HOURS),
  whatsappNumber: normaliseWhatsAppNumber(process.env.NEXT_PUBLIC_WHATSAPP_OWNER_NUMBER),
  social: {
    linkedin: clean(process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN),
    instagram: clean(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM),
    facebook: clean(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK),
    x: clean(process.env.NEXT_PUBLIC_SOCIAL_X),
  },
  /** Destinations offered in the enquiry form's "shipping destination" helper. */
  exportRegions: [
    "Middle East",
    "Africa",
    "Southeast Asia",
    "CIS countries",
    "Latin America",
    "Europe",
    "Oceania",
  ],
} as const;

export const businessTypes = [
  "Distributor",
  "Wholesaler",
  "Importer",
  "Pharmacy",
  "Hospital",
  "Other",
] as const;

export type BusinessType = (typeof businessTypes)[number];
