"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Category } from "@/types/medicine";
import { EmptyState } from "@/components/ui/states";
import { CategoryCard } from "./category-card";

export function CategoryBrowser({ categories }: { categories: Category[] }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    return t ? sorted.filter((c) => c.name.toLowerCase().includes(t)) : sorted;
  }, [categories, q]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {list.length} of {categories.length} categories
        </p>
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <label htmlFor="cat-filter" className="sr-only">
            Filter categories
          </label>
          <input
            id="cat-filter"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter categories"
            className="field h-11 rounded-full pl-11"
          />
        </div>
      </div>
      {list.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      ) : (
        <EmptyState className="mt-6" title="No matching categories" description="Try a broader term." />
      )}
    </div>
  );
}
