import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import {
  CategoriesSection,
  CategoriesSkeleton,
  CtaBand,
  ExportSection,
  FeaturedProducts,
  FeaturedSkeleton,
  ProcessSection,
  TrustStrip,
  WhySection,
} from "@/components/home/sections";

// Catalogue sections are regenerated in the background at most every 6 hours (ISR).
export const revalidate = 21600;

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesSection />
      </Suspense>
      <Suspense fallback={<FeaturedSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      <WhySection />
      <ExportSection />
      <ProcessSection />
      <CtaBand />
    </>
  );
}
