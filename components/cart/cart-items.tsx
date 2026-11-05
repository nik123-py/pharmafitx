"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, MessageSquarePlus, Trash2 } from "lucide-react";
import { useCart, type CartItem } from "@/store/cart";
import { ProductVisual } from "@/components/products/product-visual";
import { QuantityStepper, UnitSelect } from "@/components/products/enquiry-panel";
import { cn } from "@/lib/utils/cn";

function CartRow({ item, index }: { item: CartItem; index: number }) {
  const { remove, setQuantity, setUnit, setNotes } = useCart.getState();
  const [showNotes, setShowNotes] = useState(item.notes.length > 0);
  const [showSpecs, setShowSpecs] = useState(false);
  const specs = [
    ["Composition", item.composition],
    ["Strength", item.strength],
    ["Dosage form", item.dosageForm],
    ["Pack", item.packaging],
    ["Manufacturer", item.manufacturer],
  ].filter(([, v]) => v) as Array<[string, string]>;

  return (
    <li className="py-5 first:pt-0 last:pb-0">
      <div className="flex gap-4">
        <Link href={`/products/${item.id}`} className="shrink-0" tabIndex={-1} aria-hidden>
          <ProductVisual image={item.image} name={item.name} dosageForm={item.dosageForm} size="sm" className="size-16 sm:size-20" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted">#{index + 1}</p>
              <Link href={`/products/${item.id}`} className="font-display text-[1rem] font-semibold leading-snug hover:text-brand-dark">
                {item.name}
              </Link>
              <p className="mt-0.5 truncate text-sm text-muted">
                {[item.strength, item.dosageForm, item.manufacturer].filter(Boolean).join(" · ") || "Specifications on product page"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(item.id)}
              aria-label={`Remove ${item.name}`}
              className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-danger-soft hover:text-danger"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <QuantityStepper value={item.quantity} onChange={(n) => setQuantity(item.id, n)} compact />
            <UnitSelect value={item.unit} onChange={(u) => setUnit(item.id, u)} className="h-10 text-sm" />
            <button
              type="button"
              onClick={() => setShowNotes((v) => !v)}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors",
                showNotes ? "bg-sage text-brand-dark" : "text-brand hover:bg-mist",
              )}
            >
              <MessageSquarePlus className="size-4" /> {item.notes ? "Edit requirement" : "Add requirement"}
            </button>
            {specs.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSpecs((v) => !v)}
                aria-expanded={showSpecs}
                className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm text-muted hover:bg-mist hover:text-ink"
              >
                Specs <ChevronDown className={cn("size-4 transition-transform", showSpecs && "rotate-180")} />
              </button>
            )}
          </div>

          {showSpecs && (
            <dl className="mt-3 grid gap-x-6 gap-y-1.5 rounded-2xl bg-mist p-4 text-sm sm:grid-cols-2">
              {specs.map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="shrink-0 text-muted">{k}:</dt>
                  <dd className="text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {showNotes && (
            <div className="mt-3">
              <label htmlFor={`note-${item.id}`} className="sr-only">
                Requirement for {item.name}
              </label>
              <textarea
                id={`note-${item.id}`}
                value={item.notes}
                onChange={(e) => setNotes(item.id, e.target.value)}
                maxLength={400}
                rows={2}
                placeholder="e.g. preferred pack size, shelf-life requirement, alternative brands acceptable…"
                className="field resize-y text-sm"
              />
              <p className="mt-1 text-right text-[0.7rem] text-muted">{item.notes.length}/400</p>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function CartItems() {
  const items = useCart((s) => s.items);
  return (
    <ul className="divide-y divide-line">
      {items.map((item, i) => (
        <CartRow key={item.id} item={item} index={i} />
      ))}
    </ul>
  );
}
