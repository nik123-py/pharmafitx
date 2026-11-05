import type { EnquiryPayload, EnquiryItem } from "@/lib/validations/enquiry";

/**
 * Deterministic WhatsApp enquiry message. Used when Groq is unavailable or its
 * output fails validation, so an enquiry is never lost. Uses WhatsApp *bold*.
 */

export function formatQuantity(n: number) {
  return n.toLocaleString("en-US");
}

export function itemSpecLines(item: EnquiryItem): string[] {
  const lines: string[] = [];
  if (item.composition) lines.push(`Composition: ${item.composition}`);
  if (item.strength) lines.push(`Strength: ${item.strength}`);
  if (item.dosageForm) lines.push(`Dosage form: ${item.dosageForm}`);
  if (item.packaging) lines.push(`Pack: ${item.packaging}`);
  if (item.manufacturer) lines.push(`Manufacturer: ${item.manufacturer}`);
  return lines;
}

export function buildTemplateMessage(payload: EnquiryPayload, companyName = "Pharmafitx"): string {
  const { customer: c, items, message } = payload;
  const out: string[] = [];

  out.push(`Hello ${companyName} Team,`);
  out.push("");
  out.push("I would like to request a quotation for the following pharmaceutical products.");
  out.push("");
  out.push("*CUSTOMER DETAILS*");
  out.push(`Company: ${c.companyName}`);
  out.push(`Contact: ${c.contactPerson}`);
  out.push(`Business type: ${c.businessType}`);
  out.push(`Email: ${c.email}`);
  out.push(`WhatsApp: ${c.whatsapp}`);
  out.push(`Country: ${c.country}`);
  out.push("");
  out.push("*PRODUCT REQUIREMENTS*");
  items.forEach((item, idx) => {
    out.push(`${idx + 1}. ${item.name}`);
    out.push(`   Quantity: ${formatQuantity(item.quantity)} ${item.unit.toLowerCase()}`);
    for (const line of itemSpecLines(item)) out.push(`   ${line}`);
    if (item.notes) out.push(`   Note: ${item.notes.replace(/\n+/g, " ")}`);
    out.push(`   Ref: ${item.id}`);
  });
  out.push("");
  out.push("*SHIPPING DESTINATION*");
  out.push(c.shippingDestination);
  if (c.additionalRequirements) {
    out.push("");
    out.push("*ADDITIONAL REQUIREMENTS*");
    out.push(c.additionalRequirements);
  }
  if (message) {
    out.push("");
    out.push("*MESSAGE*");
    out.push(message);
  }
  out.push("");
  out.push("Please share pricing, availability, packaging details and export shipping information.");
  out.push("");
  out.push("Looking forward to your response.");
  out.push("");
  out.push("Regards,");
  out.push(c.contactPerson);
  out.push(c.companyName);
  return out.join("\n");
}
