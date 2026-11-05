import "server-only";
import { cache } from "react";
import { integrations } from "@/config/integrations";
import type { Category } from "@/types/medicine";
import { drugsetuRequest } from "./client";
import { isCategoryId } from "./ids";
import { normalizeCategory } from "./normalizers";
import { rawCategorySchema, rawPageSchema } from "./types";

const categoryPage = rawPageSchema(rawCategorySchema);
const DAY = 60 * 60 * 24;

/** Walks the cursor-paginated /categories endpoint (48 categories at the time of writing). */
export const getAllCategories = cache(async (maxPages = 30): Promise<Category[]> => {
  const out: Category[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const res = await drugsetuRequest({
      path: "/categories",
      query: { limit: integrations.drugsetu.pageSize, cursor },
      schema: categoryPage,
      revalidate: DAY,
    });
    out.push(...res.data.map(normalizeCategory));
    if (!res.has_next || !res.next_cursor) break;
    cursor = res.next_cursor;
  }
  // De-duplicate defensively (cursor pagination can repeat on concurrent inserts).
  return [...new Map(out.map((c) => [c.id, c])).values()];
});

export const getCategory = cache(async (id: string): Promise<Category | null> => {
  if (!isCategoryId(id)) return null;
  const raw = await drugsetuRequest({
    path: `/categories/${encodeURIComponent(id)}`,
    schema: rawCategorySchema,
    revalidate: DAY,
  }).catch(() => null);
  return raw ? normalizeCategory(raw) : null;
});
