import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types/medicine";
import { displayCategoryName } from "@/services/drugsetu/normalizers";
import { cn } from "@/lib/utils/cn";
import { categoryMeta } from "./category-meta";

export function CategoryCard({ category, featured = false }: { category: Category; featured?: boolean }) {
  const name = displayCategoryName(category.name);
  const { icon: Icon, blurb } = categoryMeta(category.name);
  return (
    <Link
      href={`/categories/${category.id}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift",
        featured ? "bg-sage hover:border-sage-strong" : "bg-white hover:border-sage-strong",
      )}
    >
      <div
        aria-hidden
        className="absolute -right-10 -top-10 size-36 rounded-full bg-sage/60 transition-transform duration-500 group-hover:scale-125"
      />
      <div className="relative grid size-12 place-items-center rounded-2xl bg-white text-brand shadow-soft">
        <Icon className="size-5" strokeWidth={1.7} />
      </div>
      <h3 className="relative mt-6 text-lg font-semibold leading-snug">{name}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-muted">{blurb}</p>
      <span className="relative mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-brand-dark">
        Explore
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
