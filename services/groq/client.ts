import "server-only";
import { integrations } from "@/config/integrations";
import type { EnquiryPayload } from "@/lib/validations/enquiry";
import { buildSystemPrompt, buildUserPrompt } from "./prompt";
import { validateGeneratedMessage } from "./validate";

export type GenerationResult =
  | { ok: true; message: string; model: string }
  | { ok: false; reason: string };

interface ChatCompletion {
  choices?: Array<{ message?: { content?: string | null } }>;
}

/** Calls Groq's OpenAI-compatible chat completions endpoint and validates the output. */
export async function generateEnquiryMessage(
  payload: EnquiryPayload,
  companyName: string,
): Promise<GenerationResult> {
  const { apiKey, model, baseUrl, timeoutMs } = integrations.groq;
  if (!apiKey) return { ok: false, reason: "GROQ_API_KEY not configured" };

  const body: Record<string, unknown> = {
    model,
    temperature: 0.2,
    max_completion_tokens: 2048,
    messages: [
      { role: "system", content: buildSystemPrompt(companyName) },
      { role: "user", content: buildUserPrompt(payload) },
    ],
  };
  // GPT-OSS / Qwen reasoning models on Groq: keep reasoning short and out of the content.
  if (/gpt-oss|qwen/i.test(model)) {
    body.reasoning_effort = "low";
    body.include_reasoning = false;
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (err) {
    return { ok: false, reason: `Groq request failed: ${(err as Error).name}` };
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { ok: false, reason: `Groq HTTP ${res.status}: ${detail.slice(0, 200)}` };
  }

  let json: ChatCompletion;
  try {
    json = (await res.json()) as ChatCompletion;
  } catch {
    return { ok: false, reason: "Groq returned invalid JSON" };
  }

  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) return { ok: false, reason: "Groq returned an empty message" };

  const message = content
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/\n?```$/, "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const check = validateGeneratedMessage(message, payload);
  if (!check.ok) return { ok: false, reason: `Validation failed: ${check.problems.join(", ")}` };

  return { ok: true, message, model };
}
