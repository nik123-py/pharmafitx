import type {
  Category,
  Faq,
  Ingredient,
  Medicine,
  MedicineSummary,
  Packaging,
  ProductType,
  SafetyNote,
} from "@/types/medicine";
import type { RawCategory, RawProduct, RawSearchItem } from "./types";

/**
 * Maps raw DrugSetu payloads to the internal model.
 * Rules: never invent values. Derived fields are limited to
 *  - `ingredients` / `strength`: parsed from the DrugSetu composition string,
 *  - `dosageForm`: DrugSetu packaging `product_form`, or (for search results that
 *    carry no packaging) a dosage-form word that literally appears in the product name.
 */

const clean = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.replace(/\s+/g, " ").trim();
  if (!t || /^(na|n\/a|null|none|-)$/i.test(t)) return undefined;
  return t;
};

export function parseComposition(composition?: string | null): Ingredient[] {
  const c = clean(composition);
  if (!c) return [];
  return c
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
      if (!m) return { name: part };
      return { name: m[1].trim(), strength: clean(m[2]) };
    });
}

export function strengthFromIngredients(ingredients: Ingredient[]): string | undefined {
  const s = ingredients.map((i) => i.strength).filter(Boolean) as string[];
  if (!s.length) return undefined;
  return s.join(" + ");
}

const DOSAGE_FORMS = [
  "Soft Gelatin Capsule",
  "Chewable Tablet",
  "Oral Suspension",
  "Dry Syrup",
  "Eye Drop",
  "Ear Drop",
  "Nasal Drop",
  "Nasal Spray",
  "Powder for Injection",
  "Tablet",
  "Capsule",
  "Injection",
  "Infusion",
  "Syrup",
  "Suspension",
  "Solution",
  "Drop",
  "Drops",
  "Cream",
  "Gel",
  "Ointment",
  "Lotion",
  "Powder",
  "Sachet",
  "Spray",
  "Inhaler",
  "Respules",
  "Rotacap",
  "Softgel",
  "Vegicap",
  "Granules",
  "Shampoo",
  "Soap",
  "Lozenge",
  "Patch",
  "Kit",
];

export function dosageFormFromName(name: string): string | undefined {
  const lower = name.toLowerCase();
  for (const form of DOSAGE_FORMS) {
    const re = new RegExp(`\\b${form.toLowerCase().replace(/\s+/g, "\\s+")}s?\\b`);
    if (re.test(lower)) return form;
  }
  return undefined;
}

function productType(v?: string | null): ProductType {
  return v === "non-med" ? "non-med" : "drug";
}

function safeImage(v: unknown): string | undefined {
  const url = typeof v === "string" ? v : (v as { url?: string } | null)?.url;
  if (typeof url !== "string") return undefined;
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function normalizeSearchItem(raw: RawSearchItem): MedicineSummary {
  const ingredients = parseComposition(raw.composition);
  return {
    id: raw.product_id,
    name: clean(raw.product_name) ?? raw.product_id,
    type: productType(raw.product_type),
    composition: clean(raw.composition),
    ingredients,
    strength: strengthFromIngredients(ingredients),
    manufacturer: clean(raw.marketing_company),
    dosageForm: dosageFormFromName(raw.product_name),
  };
}

const SAFETY_LABELS: Array<[keyof RawProduct, string]> = [
  ["alcohol_interaction", "Alcohol"],
  ["pregnancy", "Pregnancy"],
  ["breastfeeding", "Breastfeeding"],
  ["driving", "Driving"],
  ["kidney", "Kidney"],
  ["liver", "Liver"],
];

function normalizePackaging(p: NonNullable<RawProduct["packagings"]>[number]): Packaging {
  return {
    packaging: clean(p.packaging),
    package: clean(p.package),
    quantity: clean(p.qty == null ? undefined : String(p.qty)),
    dosageForm: clean(p.product_form),
  };
}

function normalizeFaq(list: unknown[] | null | undefined): Faq[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((f) => {
      const o = (f ?? {}) as Record<string, unknown>;
      const question = clean(o.question ?? o.q ?? o.title);
      const answer = clean(o.answer ?? o.a ?? o.description);
      return question && answer ? { question, answer } : null;
    })
    .filter((x): x is Faq => x !== null);
}

function textOf(v: unknown): string | undefined {
  if (typeof v === "string") return clean(v);
  if (v && typeof v === "object") return clean((v as { description?: unknown }).description);
  return undefined;
}

export function normalizeProduct(raw: RawProduct): Medicine {
  const base = normalizeSearchItem(raw);
  const packagings = (raw.packagings ?? []).map(normalizePackaging);
  const images = (raw.product_images ?? []).map(safeImage).filter((x): x is string => !!x);
  const primaryPack = packagings[0];

  const safety: SafetyNote[] = SAFETY_LABELS.flatMap(([key, label]) => {
    const v = raw[key] as { severity?: string | null; description?: string | null } | null | undefined;
    const description = clean(v?.description);
    if (!description) return [];
    return [{ key: String(key), label, severity: clean(v?.severity) ?? "info", description }];
  });

  const habit = raw.habit_forming;
  return {
    ...base,
    dosageForm: primaryPack?.dosageForm ?? base.dosageForm,
    packaging: primaryPack?.packaging,
    image: images[0],
    images,
    packagings,
    categoryId: clean(raw.category_id),
    categoryName: clean(raw.category_name),
    description: clean(raw.product_information),
    usage: clean(raw.product_usage),
    benefits: clean(raw.benefits),
    howItWorks: clean(raw.how_it_works),
    sideEffects: (clean(raw.side_effects) ?? "")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean),
    safety,
    missedDose: textOf(raw.missed_dose),
    faq: normalizeFaq(raw.faq),
    chemicalClass: clean(raw.chemical_class),
    actionClass: clean(raw.action_class),
    habitForming: typeof habit === "boolean" ? (habit ? "Yes" : "No") : clean(habit),
    manufacturingCompany: clean(raw.manufacturing_company),
  };
}

/** Cards only need the summary; full products are trimmed before crossing to the client. */
export function toSummary(m: Medicine): MedicineSummary {
  return {
    id: m.id,
    name: m.name,
    type: m.type,
    composition: m.composition,
    ingredients: m.ingredients,
    strength: m.strength,
    manufacturer: m.manufacturer,
    dosageForm: m.dosageForm,
    packaging: m.packaging,
    image: m.image,
    categoryId: m.categoryId,
    categoryName: m.categoryName,
  };
}

export function normalizeCategory(raw: RawCategory): Category {
  return { id: raw.category_id, name: clean(raw.category_name) ?? raw.category_id };
}

/** "ANTI INFECTIVES" → "Anti Infectives"; mixed-case names are kept as DrugSetu wrote them. */
export function displayCategoryName(name: string) {
  if (name !== name.toUpperCase()) return name;
  return name.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());
}
