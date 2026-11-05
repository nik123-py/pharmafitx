import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CategoryBrowser } from "@/components/categories/category-browser";
import { ErrorState } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";
import { DrugsetuError, drugsetuErrorMessages, getAllCategories } from "@/services/drugsetu";
import type { Category } from "@/types/medicine";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse pharmaceutical and healthcare product categories from the Pharmafitx catalogue.",
};

export default async function CategoriesPage() {
  let categories: Category[] = [];
  let error: string | null = null;
  try {
    categories = await getAllCategories();
  } catch (e) {
    error = e instanceof DrugsetuError ? drugsetuErrorMessages[e.code] : "Categories are unavailable right now.";
  }

  return (
    <>
      <PageHeader
        eyebrow="Categories"
        title="Explore the catalogue by category"
        description="Therapeutic and healthcare categories, sourced live from the DrugSetu pharmaceutical catalogue."
        crumbs={[{ label: "Categories" }]}
      />
      <div className="container-page mt-10">
        {error ? (
          <ErrorState
            title="Categories unavailable"
            description={error}
            action={
              <ButtonLink href="/products" variant="outline">
                Search products instead
              </ButtonLink>
            }
          />
        ) : (
          <CategoryBrowser categories={categories} />
        )}
      </div>
    </>
  );
}
