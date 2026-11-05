import type { EnquiryPayload } from "@/lib/validations/enquiry";
import { formatQuantity } from "@/lib/enquiry/template";

/**
 * Guards against hallucination and prompt injection: the generated message must
 * contain every original fact and must not introduce pricing or currency amounts
 * that were not in the input. Any failure → deterministic template is used.
 */

const norm = (s: string) =>
  s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const MONEY_RE =
  /(?:[$€£₹¥]|\b(?:usd|inr|eur|gbp|aed|sar|rs\.?|rupees?|dollars?)\b)\s?\d|\d\s?(?:usd|inr|eur|gbp|aed|sar)\b/i;

export interface ValidationResult {
  ok: boolean;
  problems: string[];
}

export function validateGeneratedMessage(message: string, payload: EnquiryPayload): ValidationResult {
  const problems: string[] = [];
  const out = norm(message);
  const c = payload.customer;

  if (message.length < 80) problems.push("too short");
  if (message.length > 4000) problems.push("too long");
  if (/```|<\/?enquiry_data>/i.test(message)) problems.push("contains formatting artefacts");

  const required: Array<[string, string]> = [
    ["company", c.companyName],
    ["contact", c.contactPerson],
    ["email", c.email],
    ["whatsapp", c.whatsapp],
    ["country", c.country],
    ["destination", c.shippingDestination],
  ];
  for (const [label, value] of required) {
    if (!out.includes(norm(value))) problems.push(`missing ${label}`);
  }

  payload.items.forEach((item, i) => {
    if (!out.includes(norm(item.name))) problems.push(`missing product ${i + 1} name`);
    if (!out.includes(norm(item.id))) problems.push(`missing product ${i + 1} ref`);
    const q1 = formatQuantity(item.quantity);
    const q2 = String(item.quantity);
    if (!out.includes(q1) && !out.includes(q2)) problems.push(`missing product ${i + 1} quantity`);
  });

  const inputText = norm(JSON.stringify(payload));
  if (MONEY_RE.test(message) && !MONEY_RE.test(inputText)) problems.push("introduced pricing");

  return { ok: problems.length === 0, problems };
}
