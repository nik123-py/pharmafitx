import { z } from "zod";

/**
 * Raw DrugSetu response schemas, written from live responses of
 * https://api.drugsetu.com/v1 (verified 2026-11-05):
 *
 *   GET /products/search?q=<1-100 chars>&type=drug|non-med  → RawSearchItem[] (max 10, no pagination)
 *   GET /products?type=&limit=<=5&cursor=                   → { data: RawProduct[], limit, has_next, next_cursor }
 *   GET /products/:product_id                               → RawProduct
 *   GET /categories?limit=&cursor=                          → { data: RawCategory[], ... }
 *   GET /categories/:category_id                            → RawCategory
 *   GET /companies?limit=&cursor=                           → { data: RawCompany[], ... }
 *
 * Auth: header `X-API-Key: <private key>`. Unknown query params → 400.
 * Rate limit: ~1 req/s on the trial plan → 429 { retryAfter: seconds }.
 *
 * Schemas are lenient (nullable/optional everywhere) because DrugSetu leaves
 * many fields null. Pricing fields (mrp) are intentionally NOT mapped.
 */

const str = z.string().nullish();

export const rawSafetySchema = z
  .object({ severity: str, description: str })
  .passthrough()
  .nullish();

export const rawPackagingSchema = z
  .object({
    packaging: str,
    package: str,
    qty: z.union([z.string(), z.number()]).nullish(),
    product_form: str,
  })
  .passthrough();

export const rawSearchItemSchema = z
  .object({
    product_id: z.string(),
    product_name: z.string(),
    product_type: str,
    composition: str,
    marketing_company: str,
  })
  .passthrough();

export const rawProductSchema = rawSearchItemSchema.extend({
  packagings: z.array(rawPackagingSchema).nullish(),
  product_information: str,
  product_images: z.array(z.unknown()).nullish(),
  manufacturing_company: str,
  product_usage: str,
  benefits: str,
  side_effects: str,
  how_it_works: str,
  alcohol_interaction: rawSafetySchema,
  pregnancy: rawSafetySchema,
  breastfeeding: rawSafetySchema,
  driving: rawSafetySchema,
  kidney: rawSafetySchema,
  liver: rawSafetySchema,
  missed_dose: z.unknown().nullish(),
  faq: z.array(z.unknown()).nullish(),
  chemical_class: str,
  habit_forming: z.union([z.string(), z.boolean()]).nullish(),
  category_id: str,
  category_name: str,
  action_class: str,
});

export const rawCategorySchema = z
  .object({ category_id: z.string(), category_name: z.string() })
  .passthrough();

export function rawPageSchema<T extends z.ZodTypeAny>(item: T) {
  return z
    .object({
      data: z.array(item),
      limit: z.number().nullish(),
      has_next: z.boolean().nullish(),
      next_cursor: z.string().nullish(),
    })
    .passthrough();
}

export type RawSearchItem = z.infer<typeof rawSearchItemSchema>;
export type RawProduct = z.infer<typeof rawProductSchema>;
export type RawCategory = z.infer<typeof rawCategorySchema>;
