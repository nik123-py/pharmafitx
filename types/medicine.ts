/**
 * Internal, normalised product model used across the UI.
 * Every optional field is only set when DrugSetu actually returned it —
 * nothing here is inferred beyond what is documented in normalizers.ts.
 */

export type ProductType = "drug" | "non-med";

export type SafetySeverity = "safe" | "caution" | "unsafe" | "consult_doctor" | string;

export interface SafetyNote {
  key: string;
  label: string;
  severity: SafetySeverity;
  description: string;
}

export interface Packaging {
  packaging?: string;
  package?: string;
  quantity?: string;
  dosageForm?: string;
}

export interface Ingredient {
  name: string;
  strength?: string;
}

export interface Faq {
  question: string;
  answer: string;
}

/** Lightweight shape returned by search and used on cards. */
export interface MedicineSummary {
  id: string;
  name: string;
  type: ProductType;
  composition?: string;
  ingredients: Ingredient[];
  /** e.g. "500mg / 50mg" — parsed from the DrugSetu composition string. */
  strength?: string;
  manufacturer?: string;
  dosageForm?: string;
  packaging?: string;
  image?: string;
  categoryId?: string;
  categoryName?: string;
}

/** Full detail shape from GET /v1/products/:id. */
export interface Medicine extends MedicineSummary {
  images: string[];
  packagings: Packaging[];
  description?: string;
  usage?: string;
  benefits?: string;
  howItWorks?: string;
  sideEffects: string[];
  safety: SafetyNote[];
  missedDose?: string;
  faq: Faq[];
  chemicalClass?: string;
  actionClass?: string;
  habitForming?: string;
  manufacturingCompany?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
  hasNext: boolean;
}
