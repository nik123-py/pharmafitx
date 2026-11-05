/**
 * WhatsApp click-to-chat helpers. wa.me only OPENS a chat with the text prefilled —
 * the customer still has to press Send. Kept isolated so a future WhatsApp Business
 * Cloud API integration can replace `buildWhatsAppUrl` without touching the UI.
 */

export function buildWhatsAppUrl(ownerNumber: string, message?: string) {
  const digits = ownerNumber.replace(/[^\d]/g, "");
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function formatPhoneForDisplay(digits: string) {
  return digits ? `+${digits}` : "";
}
