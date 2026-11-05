import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import type { MedicineSummary } from "@/types/medicine";
import { displayCategoryName } from "@/services/drugsetu/normalizers";
import { ProductVisual } from "./product-visual";
import { AddToEnquiryButton } from "./add-to-enquiry";

export function SpecChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center truncate rounded-full border border-line bg-white px-2.5 py-1 text-[0.72rem] font-medium text-ink/80">
      {children}
    </span>
  );
}

export function ProductCard({ product }: { product: MedicineSummary }) {
  const href = `/products/${product.id}`;
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-line bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-sage-strong hover:shadow-lift">
      <Link href={href} className="relative block" tabIndex={-1} aria-hidden>
        <ProductVisual
          image={product.image}
          name={product.name}
          dosageForm={product.dosageForm}
          className="aspect-[4/3] w-full"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-brand-dark shadow-sm">
          {product.type === "drug" ? "Medicine" : "Healthcare"}
        </span>
        <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/95 text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
        {product.categoryName && (
          <p className="mb-1.5 truncate text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-brand">
            {displayCategoryName(product.categoryName)}
          </p>
        )}
        <h3 className="font-display text-[1.02rem] font-semibold leading-snug text-ink">
          <Link href={href} className="line-clamp-2 hover:text-brand-dark">
            {product.name}
          </Link>
        </h3>
        {product.composition ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{product.composition}</p>
        ) : (
          <p className="mt-1.5 text-sm italic text-muted/70">Composition not listed</p>
        )}
        {product.manufacturer && (
          <p className="mt-2.5 flex items-center gap-1.5 truncate text-xs text-muted">
            <Building2 className="size-3.5 shrink-0" strokeWidth={1.8} />
            <span className="truncate">{product.manufacturer}</span>
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.strength && <SpecChip>{product.strength}</SpecChip>}
          {product.dosageForm && <SpecChip>{product.dosageForm}</SpecChip>}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-5">
          <Link
            href={href}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-line px-2 text-[0.8rem] font-medium text-ink transition-colors hover:border-brand-light hover:text-brand-dark"
          >
            View Details
          </Link>
          <AddToEnquiryButton product={product} className="flex-1 px-2 text-[0.8rem]" label="Add to Enquiry" />
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-line bg-white p-3">
      <div className="skeleton aspect-[4/3] w-full rounded-2xl" />
      <div className="space-y-2.5 px-2 pb-2 pt-4">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-2/3" />
        <div className="flex gap-2 pt-4">
          <div className="skeleton h-9 flex-1 rounded-full" />
          <div className="skeleton h-9 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}
