import { z } from "zod";
import { businessTypes } from "@/config/business";
import { PRODUCT_ID_RE } from "@/services/drugsetu/ids";

/** Shared by the client form and the server route — the server always re-validates. */

export const quantityUnits = ["Units", "Strips", "Boxes", "Bottles", "Vials", "Packs", "Cartons"] as const;
export type QuantityUnit = (typeof quantityUnits)[number];

export const MAX_QUANTITY = 10_000_000;
export const MAX_ITEMS = 40;

/** Removes control characters (keeps newlines where allowed) and trims. */
export function sanitiseText(value: string, { multiline = false } = {}) {
  let v = value.normalize("NFKC");
  v = multiline
    ? v.replace(/[\u0000-\u0009\u000b-\u001f\u007f\u200b-\u200f\u2028-\u202e]/g, "")
    : v.replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e]/g, " ");
  v = v.replace(/[<>]/g, "").replace(/`{3,}/g, "");
  v = multiline ? v.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : v.replace(/\s+/g, " ");
  return v.trim();
}

const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} is required` })
    .transform((v) => sanitiseText(v))
    .pipe(
      z
        .string()
        .min(min, min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
        .max(max, `${label} must be at most ${max} characters`),
    );

const optionalLongText = (max: number, label: string) =>
  z
    .string()
    .optional()
    .default("")
    .transform((v) => sanitiseText(v, { multiline: true }))
    .pipe(z.string().max(max, `${label} must be at most ${max} characters`));

export const customerSchema = z.object({
  companyName: text(2, 120, "Company name"),
  contactPerson: text(2, 80, "Contact person"),
  email: z
    .string({ error: "Business email is required" })
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid business email").max(120)),
  whatsapp: z
    .string({ error: "WhatsApp number is required" })
    .transform((v) => v.replace(/[\s().-]/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\+?[1-9]\d{6,14}$/, "Enter the number in international format, e.g. +971501234567"),
    )
    .transform((v) => (v.startsWith("+") ? v : `+${v}`)),
  country: text(2, 60, "Country"),
  businessType: z.enum(businessTypes, { error: "Select your business type" }),
  shippingDestination: text(2, 120, "Shipping destination"),
  additionalRequirements: optionalLongText(1500, "Additional requirements"),
});

export const enquiryItemSchema = z.object({
  id: z.string().regex(PRODUCT_ID_RE, "Invalid product reference"),
  name: text(1, 200, "Product name"),
  quantity: z.coerce
    .number({ error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(MAX_QUANTITY, `Quantity must be at most ${MAX_QUANTITY.toLocaleString("en-US")}`),
  unit: z.enum(quantityUnits).default("Units"),
  notes: optionalLongText(400, "Product requirement"),
  // Client-side snapshot; the server replaces these with DrugSetu data when it can verify the product.
  composition: z.string().max(400).optional(),
  strength: z.string().max(120).optional(),
  dosageForm: z.string().max(80).optional(),
  manufacturer: z.string().max(160).optional(),
  packaging: z.string().max(160).optional(),
});

export const enquirySchema = z.object({
  customer: customerSchema,
  items: z
    .array(enquiryItemSchema)
    .min(1, "Add at least one product to your enquiry")
    .max(MAX_ITEMS, `An enquiry can include at most ${MAX_ITEMS} products`),
  message: optionalLongText(1500, "Enquiry message"),
  /** Honeypot — real users never fill this. */
  website: z.string().max(0).optional(),
});

export type CustomerInput = z.input<typeof customerSchema>;
export type Customer = z.output<typeof customerSchema>;
export type EnquiryItem = z.output<typeof enquiryItemSchema>;
export type EnquiryPayload = z.output<typeof enquirySchema>;
export type EnquiryInput = z.input<typeof enquirySchema>;

/** Flatten zod issues into `{ "customer.email": "..." }` for form display. */
export function issuesToFieldErrors(issues: z.core.$ZodIssue[]) {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = i.path.join(".");
    if (!out[key]) out[key] = i.message;
  }
  return out;
}
