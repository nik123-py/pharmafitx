import { NextResponse, type NextRequest } from "next/server";
import { browseProducts, searchProducts, sanitiseQuery } from "@/services/drugsetu";
import { isCategoryId, isCursor } from "@/services/drugsetu/ids";
import { catalogueErrorResponse, tooManyRequests } from "@/lib/api/responses";
import { clientIp, rateLimit } from "@/lib/api/rate-limit";
import type { ProductType } from "@/types/medicine";

export const maxDuration = 30;

/**
 * GET /api/products
 *   ?q=<text>            → DrugSetu search (name, composition, manufacturer), top 10
 *   ?cursor=<opaque>     → next catalogue page(s)
 *   ?type=drug|non-med
 *   ?category=<cat_id>   → scans catalogue pages and filters by category (no upstream filter exists)
 */
export async function GET(req: NextRequest) {
  const rl = rateLimit(`products:${clientIp(req)}`, 60, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const sp = req.nextUrl.searchParams;
  const q = sanitiseQuery(sp.get("q") ?? "");
  const typeParam = sp.get("type");
  const type: ProductType | undefined =
    typeParam === "drug" || typeParam === "non-med" ? typeParam : undefined;
  const cursorParam = sp.get("cursor");
  const cursor = cursorParam && isCursor(cursorParam) ? cursorParam : null;
  const categoryParam = sp.get("category");
  const category = categoryParam && isCategoryId(categoryParam) ? categoryParam : undefined;

  if (cursorParam && !cursor) {
    return NextResponse.json({ error: { code: "bad_request", message: "Invalid cursor" } }, { status: 400 });
  }

  try {
    if (q) {
      const items = await searchProducts(q, type);
      return NextResponse.json(
        { mode: "search", items, nextCursor: null, hasNext: false },
        { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } },
      );
    }
    const page = await browseProducts({
      cursor,
      type,
      categoryId: category,
      pages: category ? 4 : 2,
      want: category ? 8 : undefined,
    });
    return NextResponse.json(
      { mode: "browse", ...page },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } },
    );
  } catch (err) {
    return catalogueErrorResponse(err);
  }
}
