"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import type { MedicineSummary, ProductType } from "@/types/medicine";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { useDebounce } from "@/hooks/use-debounce";
import { displayCategoryName } from "@/services/drugsetu/normalizers";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { cn } from "@/lib/utils/cn";
import { ProductCard, ProductCardSkeleton } from "./product-card";

interface ApiPage {
  mode: "search" | "browse";
  items: MedicineSummary[];
  nextCursor: string | null;
  hasNext: boolean;
  scanned?: number;
}

type Sort = "relevance" | "name-asc" | "name-desc";

interface ResultState {
  key: string;
  items: MedicineSummary[];
  nextCursor: string | null;
  hasNext: boolean;
  mode: "search" | "browse";
  scanned: number;
  error: string | null;
}

const TYPES: Array<{ value: ProductType | "all"; label: string }> = [
  { value: "all", label: "All products" },
  { value: "drug", label: "Medicines" },
  { value: "non-med", label: "Healthcare & wellness" },
];

function uniqueSorted(values: Array<string | undefined>) {
  return [...new Set(values.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b));
}

export function Catalogue({ categoryId, categoryName }: { categoryId?: string; categoryName?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = (params.get("q") ?? "").slice(0, 100);
  const typeParam = params.get("type");
  const type: ProductType | "all" = typeParam === "drug" || typeParam === "non-med" ? typeParam : "all";
  const key = `${q}|${type}|${categoryId ?? ""}`;

  const [input, setInput] = useState(q);
  const debounced = useDebounce(input, 450);
  const [result, setResult] = useState<ResultState | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Client-side refinements of loaded results (DrugSetu has no server filters for these).
  const [manufacturer, setManufacturer] = useState("");
  const [dosageForm, setDosageForm] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<Sort>("relevance");

  const setParams = useCallback(
    (next: Record<string, string | null>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v) sp.set(k, v);
        else sp.delete(k);
      }
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  // Push debounced input into the URL (single source of truth for the query).
  useEffect(() => {
    const trimmed = debounced.trim();
    if (trimmed === q) return;
    if (trimmed.length === 1) return; // wait for at least 2 characters
    setParams({ q: trimmed || null });
  }, [debounced, q, setParams]);

  // Fetch first page whenever the query / type / category changes.
  useEffect(() => {
    const ctrl = new AbortController();
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (type !== "all") sp.set("type", type);
    if (categoryId && !q) sp.set("category", categoryId);
    apiFetch<ApiPage>(`/api/products?${sp.toString()}`, { signal: ctrl.signal })
      .then((page) =>
        setResult({
          key,
          items: page.items,
          nextCursor: page.nextCursor,
          hasNext: page.hasNext,
          mode: page.mode,
          scanned: page.scanned ?? page.items.length,
          error: null,
        }),
      )
      .catch((err: unknown) => {
        if ((err as Error).name === "AbortError") return;
        setResult({
          key,
          items: [],
          nextCursor: null,
          hasNext: false,
          mode: q ? "search" : "browse",
          scanned: 0,
          error: err instanceof ApiClientError ? err.message : "Could not load products.",
        });
      });
    return () => ctrl.abort();
  }, [key, q, type, categoryId, reloadToken]);

  const loading = !result || result.key !== key;
  const current = loading ? null : result;

  const loadMore = async () => {
    if (!current?.nextCursor) return;
    setLoadingMore(true);
    const sp = new URLSearchParams({ cursor: current.nextCursor });
    if (type !== "all") sp.set("type", type);
    if (categoryId) sp.set("category", categoryId);
    try {
      const page = await apiFetch<ApiPage>(`/api/products?${sp.toString()}`);
      setResult((r) =>
        r && r.key === key
          ? {
              ...r,
              items: [...r.items, ...page.items.filter((p) => !r.items.some((x) => x.id === p.id))],
              nextCursor: page.nextCursor,
              hasNext: page.hasNext,
              scanned: r.scanned + (page.scanned ?? page.items.length),
            }
          : r,
      );
    } catch (err) {
      setResult((r) =>
        r ? { ...r, error: err instanceof ApiClientError ? err.message : "Could not load more products." } : r,
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const items = useMemo(() => current?.items ?? [], [current]);
  const manufacturers = useMemo(() => uniqueSorted(items.map((i) => i.manufacturer)), [items]);
  const forms = useMemo(() => uniqueSorted(items.map((i) => i.dosageForm)), [items]);
  const categories = useMemo(() => uniqueSorted(items.map((i) => i.categoryName)), [items]);

  const visible = useMemo(() => {
    let list = items.filter(
      (i) =>
        (!manufacturer || i.manufacturer === manufacturer) &&
        (!dosageForm || i.dosageForm === dosageForm) &&
        (!category || i.categoryName === category),
    );
    if (sort !== "relevance") {
      list = [...list].sort((a, b) => (sort === "name-asc" ? 1 : -1) * a.name.localeCompare(b.name));
    }
    return list;
  }, [items, manufacturer, dosageForm, category, sort]);

  const refinements = [manufacturer, dosageForm, category].filter(Boolean).length;
  const anyFilter = refinements > 0 || type !== "all" || !!q || sort !== "relevance";

  const clearAll = () => {
    setManufacturer("");
    setDosageForm("");
    setCategory("");
    setSort("relevance");
    setInput("");
    setParams({ q: null, type: null });
  };

  return (
    <div>
      {/* Search + controls */}
      <div className="rounded-3xl border border-line bg-white p-3 shadow-soft sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <label htmlFor="catalogue-search" className="sr-only">
              Search by medicine, brand, generic name or manufacturer
            </label>
            <input
              id="catalogue-search"
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={100}
              placeholder="Search medicine, brand, generic (e.g. Paracetamol) or manufacturer"
              className="field h-12 rounded-full pl-11 pr-11"
              autoComplete="off"
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-mist hover:text-ink"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:pb-0" role="tablist" aria-label="Product type">
            {TYPES.map((t) => (
              <button
                key={t.value}
                role="tab"
                aria-selected={type === t.value}
                onClick={() => setParams({ type: t.value === "all" ? null : t.value })}
                className={cn(
                  "h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors",
                  type === t.value ? "bg-brand text-white" : "bg-mist text-ink hover:bg-sage",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className={cn(
              "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
              showFilters || refinements ? "border-brand-light bg-sage text-brand-dark" : "border-line text-ink hover:bg-mist",
            )}
          >
            <SlidersHorizontal className="size-4" /> Filters {refinements > 0 && `(${refinements})`}
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect label="Manufacturer" value={manufacturer} onChange={setManufacturer} options={manufacturers} />
            <FilterSelect label="Dosage form" value={dosageForm} onChange={setDosageForm} options={forms} />
            {!categoryId && (
              <FilterSelect
                label="Category"
                value={category}
                onChange={setCategory}
                options={categories}
                format={displayCategoryName}
                emptyHint={current?.mode === "search" ? "Not included in search results" : undefined}
              />
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field h-11 py-0">
                <option value="relevance">{q ? "Best match" : "Catalogue order"}</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
              </select>
            </label>
            <p className="text-xs leading-relaxed text-muted sm:col-span-2 lg:col-span-4">
              Filters refine the products currently loaded. Use search to look up a specific medicine, composition or
              manufacturer across the full catalogue.
            </p>
          </div>
        )}
      </div>

      {/* Status line */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <p aria-live="polite">
          {loading
            ? "Loading products…"
            : current?.error && !items.length
              ? " "
              : current?.mode === "search"
                ? `${visible.length} of top ${items.length} matches for “${q}”`
                : categoryId
                  ? `${visible.length} product${visible.length === 1 ? "" : "s"} in ${categoryName ?? "this category"} · ${current?.scanned ?? 0} catalogue entries scanned`
                  : `Showing ${visible.length} product${visible.length === 1 ? "" : "s"}`}
        </p>
        {anyFilter && (
          <button onClick={clearAll} className="inline-flex items-center gap-1.5 font-medium text-brand hover:text-brand-dark">
            <RotateCcw className="size-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* Results */}
      <div className="mt-4">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : current?.error && !items.length ? (
          <ErrorState
            title="We couldn't load the catalogue"
            description={current.error}
            action={
              <Button variant="outline" onClick={() => setReloadToken((t) => t + 1)}>
                <RotateCcw className="size-4" /> Try again
              </Button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title={items.length ? "No products match these filters" : q ? `No results for “${q}”` : "No products found yet"}
            description={
              items.length
                ? "Try removing a filter."
                : q
                  ? "Check the spelling, or search by generic composition (e.g. “Azithromycin”) or manufacturer name."
                  : categoryId
                    ? "None of the catalogue entries scanned so far are in this category. Load more to keep scanning."
                    : "Please try again shortly."
            }
            action={
              items.length ? (
                <Button variant="outline" onClick={clearAll}>
                  Clear filters
                </Button>
              ) : categoryId && current?.hasNext ? (
                <Button onClick={loadMore} disabled={loadingMore}>
                  {loadingMore && <Loader2 className="size-4 animate-spin" />} Keep scanning
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
            {loadingMore && Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={`s${i}`} />)}
          </div>
        )}

        {current?.error && items.length > 0 && (
          <p role="alert" className="mt-6 text-center text-sm text-danger">
            {current.error}
          </p>
        )}

        {!loading && current?.mode === "browse" && current.hasNext && visible.length > 0 && (
          <div className="mt-10 flex justify-center">
            <Button variant="outline" size="lg" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? <Loader2 className="size-4 animate-spin" /> : null}
              {loadingMore ? "Loading…" : "Load more products"}
            </Button>
          </div>
        )}
        {!loading && current?.mode === "search" && items.length >= 10 && (
          <p className="mt-8 text-center text-sm text-muted">
            Showing the top matches. Refine your search with a strength, dosage form or manufacturer for more specific
            results.
          </p>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  format = (s: string) => s,
  emptyHint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  format?: (s: string) => string;
  emptyHint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field h-11 py-0"
        disabled={!options.length}
      >
        <option value="">{options.length ? `All (${options.length})` : (emptyHint ?? "No options in results")}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {format(o)}
          </option>
        ))}
      </select>
    </label>
  );
}
