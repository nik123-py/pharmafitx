import { NextResponse, type NextRequest } from "next/server";
import { getAllCategories } from "@/services/drugsetu";
import { catalogueErrorResponse, tooManyRequests } from "@/lib/api/responses";
import { clientIp, rateLimit } from "@/lib/api/rate-limit";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const rl = rateLimit(`categories:${clientIp(req)}`, 30, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  try {
    const items = await getAllCategories();
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch (err) {
    return catalogueErrorResponse(err);
  }
}
