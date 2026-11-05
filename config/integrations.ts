import "server-only";
import { normaliseWhatsAppNumber } from "./business";

/**
 * Server-only integration configuration. Never import this from a client component —
 * the `server-only` import makes the build fail if that happens.
 */
export const integrations = {
  drugsetu: {
    baseUrl: (process.env.DRUGSETU_API_BASE_URL || "https://api.drugsetu.com/v1").replace(/\/$/, ""),
    apiKey: process.env.DRUGSETU_API_KEY || "",
    /** The trial plan caps list endpoints at 5 items per page. */
    pageSize: Number(process.env.DRUGSETU_PAGE_SIZE || 5),
    timeoutMs: 10_000,
    /** Seconds for Next.js data-cache revalidation of catalogue responses. */
    revalidate: 60 * 60 * 6,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    baseUrl: "https://api.groq.com/openai/v1",
    timeoutMs: 20_000,
  },
  whatsapp: {
    ownerNumber: normaliseWhatsAppNumber(
      process.env.WHATSAPP_OWNER_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_OWNER_NUMBER,
    ),
  },
} as const;

export function isDrugsetuConfigured() {
  return integrations.drugsetu.apiKey.length > 0;
}

export function isGroqConfigured() {
  return integrations.groq.apiKey.length > 0;
}
