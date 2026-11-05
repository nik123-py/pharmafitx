import { NextResponse, type NextRequest } from "next/server";
import { getProduct } from "@/services/drugsetu";
import { isProductId } from "@/services/drugsetu/ids";
import { catalogueErrorResponse, tooManyRequests } from "@/lib/api/responses";
import { clientIp, rateLimit } from "@/lib/api/rate-limit";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const rl = rateLimit(`product:${clientIp(req)}`, 60, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const { id } = await ctx.params;
  if (!isProductId(id)) {
    return NextResponse.json({ error: { code: "bad_request", message: "Invalid product id" } }, { status: 400 });
  }
  try {
    const product = await getProduct(id);
    return NextResponse.json(product, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    return catalogueErrorResponse(err);
  }
}
