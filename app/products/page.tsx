import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Catalogue } from "@/components/products/catalogue";
import { ProductCardSkeleton } from "@/components/products/product-card";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Search the Pharmafitx pharmaceutical catalogue by medicine name, brand, generic composition or manufacturer and build a bulk quotation enquiry.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Product catalogue"
        title="Find the medicines your business needs"
        description="Search by brand, generic composition or manufacturer. Add products to your enquiry — pricing and availability are quoted by our team."
        crumbs={[{ label: "Products" }]}
      />
      <div className="container-page -mt-6 relative">
        <Suspense
          fallback={
            <div className="grid gap-4 pt-24 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <Catalogue />
        </Suspense>
      </div>
    </>
  );
}
