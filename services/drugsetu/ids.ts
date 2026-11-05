/** Identifier validation shared by server routes and the client (no server-only imports). */
export const PRODUCT_ID_RE = /^prod_[A-Za-z0-9]{6,40}$/;
export const CATEGORY_ID_RE = /^cat_[A-Za-z0-9]{6,40}$/;
export const CURSOR_RE = /^[A-Za-z0-9._\-=]{1,600}$/;

export const isProductId = (v: unknown): v is string => typeof v === "string" && PRODUCT_ID_RE.test(v);
export const isCategoryId = (v: unknown): v is string => typeof v === "string" && CATEGORY_ID_RE.test(v);
export const isCursor = (v: unknown): v is string => typeof v === "string" && CURSOR_RE.test(v);
