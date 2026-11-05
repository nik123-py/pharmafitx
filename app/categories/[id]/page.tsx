import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Catalogue } from "@/components/products/catalogue";
import { ProductCardSkeleton } from "@/components/products/product-card";
import { categoryMeta } from "@/components/categories/category-meta";
import { getCategory } from "@/services/drugsetu";
import { isCategoryId } from "@/services/drugsetu/ids";
import { displayCategoryName } from "@/services/drugsetu/normalizers";

export const revalidate = 86400;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = isCategoryId(id) ? await getCategory(id) : null;
  return { title: c ? displayCategoryName(c.name) : "Category" };
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  if (!isCategoryId(id)) notFound();
  const category = await getCategory(id);
  if (!category) notFound();
  const name = displayCategoryName(category.name);

  return (
    <>
      <PageHeader
        eyebrow="Category"
        title={name}
        description={`${categoryMeta(category.name).blurb} Products are listed as they appear in the catalogue — use search to look up a specific medicine.`}
        crumbs={[{ label: "Categories", href: "/categories" }, { label: name }]}
      />
      <div className="container-page relative -mt-6">
        <Suspense
          fallback={
            <div className="grid gap-4 pt-24 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <Catalogue categoryId={category.id} categoryName={name} />
        </Suspense>
      </div>
    </>
  );
}
