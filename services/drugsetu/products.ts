import "server-only";
import { cache } from "react";
import { integrations } from "@/config/integrations";
import type { Medicine, MedicineSummary, Paginated, ProductType } from "@/types/medicine";
import { DrugsetuError, drugsetuRequest } from "./client";
import { isCursor, isProductId } from "./ids";
import { normalizeProduct, toSummary } from "./normalizers";
import { rawPageSchema, rawProductSchema } from "./types";

const productPage = rawPageSchema(rawProductSchema);

/** GET /products/:id — cached per request (React cache) and in the Next data cache. */
export const getProduct = cache(async (id: string): Promise<Medicine> => {
  if (!isProductId(id)) throw new DrugsetuError("not_found", `Invalid product id ${id}`, 404);
  const raw = await drugsetuRequest({ path: `/products/${encodeURIComponent(id)}`, schema: rawProductSchema });
  return normalizeProduct(raw);
});

/** One upstream page of GET /products (max `pageSize` items on the current plan). */
async function listProductsPage(opts: { cursor?: string | null; type?: ProductType }) {
  const res = await drugsetuRequest({
    path: "/products",
    query: {
      limit: integrations.drugsetu.pageSize,
      cursor: opts.cursor && isCursor(opts.cursor) ? opts.cursor : undefined,
      type: opts.type,
    },
    schema: productPage,
  });
  return {
    items: res.data.map(normalizeProduct),
    nextCursor: res.has_next && res.next_cursor ? res.next_cursor : null,
  };
}

/**
 * Browse the catalogue. Fetches up to `pages` upstream pages sequentially so a single
 * "load more" returns a useful number of products despite the small plan page size.
 *
 * When `categoryId` is set, DrugSetu offers no server-side category filter, so pages
 * are scanned and filtered here; `scanned` tells the UI how far the scan got.
 */
export async function browseProducts(opts: {
  cursor?: string | null;
  type?: ProductType;
  categoryId?: string;
  pages?: number;
  want?: number;
}): Promise<Paginated<MedicineSummary> & { scanned: number }> {
  const pages = Math.min(Math.max(opts.pages ?? 2, 1), 8);
  const want = opts.want ?? Number.POSITIVE_INFINITY;
  let cursor = opts.cursor ?? null;
  const items: MedicineSummary[] = [];
  let scanned = 0;

  for (let i = 0; i < pages; i++) {
    const page = await listProductsPage({ cursor, type: opts.type });
    scanned += page.items.length;
    const matches = opts.categoryId ? page.items.filter((p) => p.categoryId === opts.categoryId) : page.items;
    items.push(...matches.map(toSummary));
    cursor = page.nextCursor;
    if (!cursor || items.length >= want) break;
  }

  return { items, nextCursor: cursor, hasNext: cursor !== null, scanned };
}

/** Featured products for the homepage: the first catalogue pages of medicines. */
export const getFeaturedProducts = cache(async (count = 8): Promise<MedicineSummary[]> => {
  const pages = Math.ceil(count / integrations.drugsetu.pageSize);
  const res = await browseProducts({ type: "drug", pages });
  return res.items.slice(0, count);
});
