import "server-only";
import { z } from "zod";
import type { MedicineSummary, ProductType } from "@/types/medicine";
import { drugsetuRequest } from "./client";
import { normalizeSearchItem } from "./normalizers";
import { rawSearchItemSchema } from "./types";

const searchSchema = z.array(rawSearchItemSchema);

/** DrugSetu limits `q` to 1–100 characters. */
export function sanitiseQuery(q: string) {
  return q.replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

/**
 * GET /products/search — matches brand/product name, composition (generic / salt)
 * and marketing company (manufacturer). Returns the top 10 matches; DrugSetu does
 * not paginate search results.
 */
export async function searchProducts(q: string, type?: ProductType): Promise<MedicineSummary[]> {
  const query = sanitiseQuery(q);
  if (!query) return [];
  const res = await drugsetuRequest({
    path: "/products/search",
    query: { q: query, type },
    schema: searchSchema,
    revalidate: 60 * 60,
  });
  return res.map(normalizeSearchItem);
}
