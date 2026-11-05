import { NextResponse, type NextRequest } from "next/server";
import { businessConfig } from "@/config/business";
import { integrations } from "@/config/integrations";
import { clientIp, rateLimit } from "@/lib/api/rate-limit";
import { tooManyRequests } from "@/lib/api/responses";
import { buildTemplateMessage } from "@/lib/enquiry/template";
import { enquirySchema, issuesToFieldErrors, sanitiseText, type EnquiryItem } from "@/lib/validations/enquiry";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getProduct } from "@/services/drugsetu";
import { generateEnquiryMessage } from "@/services/groq/client";

export const maxDuration = 60;

const VERIFY_BUDGET_MS = 9000;

/**
 * Re-reads each product from DrugSetu so the message uses catalogue data rather
 * than whatever the browser sent. Bounded by a time budget; products that cannot
 * be verified in time keep their (sanitised) client snapshot.
 */
async function verifyItems(items: EnquiryItem[]) {
  const deadline = Date.now() + VERIFY_BUDGET_MS;
  let verified = 0;
  const out: EnquiryItem[] = [];
  for (const item of items) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      out.push(item);
      continue;
    }
    const product = await Promise.race([
      getProduct(item.id).catch(() => null),
      new Promise<null>((r) => setTimeout(() => r(null), remaining)),
    ]);
    if (!product) {
      out.push(item);
      continue;
    }
    verified++;
    out.push({
      ...item,
      name: product.name,
      composition: product.composition,
      strength: product.strength,
      dosageForm: product.dosageForm,
      manufacturer: product.manufacturer,
      packaging: product.packaging,
    });
  }
  return { items: out, verified };
}

function sanitiseSnapshot(item: EnquiryItem): EnquiryItem {
  const s = (v?: string) => (v ? sanitiseText(v) || undefined : undefined);
  return {
    ...item,
    composition: s(item.composition),
    strength: s(item.strength),
    dosageForm: s(item.dosageForm),
    manufacturer: s(item.manufacturer),
    packaging: s(item.packaging),
  };
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(`enquiry:${clientIp(req)}`, 6, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const ownerNumber = integrations.whatsapp.ownerNumber;
  if (!ownerNumber) {
    return NextResponse.json(
      {
        error: {
          code: "whatsapp_not_configured",
          message: "Enquiries are temporarily unavailable: the business WhatsApp number is not configured.",
        },
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { code: "bad_request", message: "Invalid JSON body" } }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "validation",
          message: "Please correct the highlighted fields.",
          fields: issuesToFieldErrors(parsed.error.issues),
        },
      },
      { status: 422 },
    );
  }
  if (parsed.data.website) {
    // Honeypot filled → silently accept without doing work.
    return NextResponse.json({ message: "", source: "template", whatsappUrl: buildWhatsAppUrl(ownerNumber) });
  }

  const { items, verified } = await verifyItems(parsed.data.items.map(sanitiseSnapshot));
  const payload = { ...parsed.data, items };

  const companyName = businessConfig.companyName;
  const ai = await generateEnquiryMessage(payload, companyName);
  if (!ai.ok) console.warn("[enquiry] using template fallback:", ai.reason);

  const message = ai.ok ? ai.message : buildTemplateMessage(payload, companyName);
  const whatsappUrl = buildWhatsAppUrl(ownerNumber, message);

  return NextResponse.json(
    {
      message,
      source: ai.ok ? "ai" : "template",
      whatsappUrl,
      whatsappBase: buildWhatsAppUrl(ownerNumber),
      verifiedProducts: verified,
      totalProducts: items.length,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
