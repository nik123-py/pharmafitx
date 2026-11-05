"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Minus, Plus } from "lucide-react";
import type { MedicineSummary } from "@/types/medicine";
import { useCart } from "@/store/cart";
import { MAX_QUANTITY, quantityUnits, type QuantityUnit } from "@/lib/validations/enquiry";
import { Button } from "@/components/ui/button";
import { AddToEnquiryButton, InCartHint, notifyAdd } from "./add-to-enquiry";

const PRESETS = [100, 500, 1000, 5000];

export function QuantityStepper({
  value,
  onChange,
  id,
  compact = false,
}: {
  value: number;
  onChange: (n: number) => void;
  id?: string;
  compact?: boolean;
}) {
  const step = value >= 1000 ? 100 : value >= 100 ? 10 : 1;
  const set = (n: number) => onChange(Math.min(MAX_QUANTITY, Math.max(1, Math.round(n) || 1)));
  return (
    <div className={`flex items-center rounded-full border border-line bg-white ${compact ? "h-10" : "h-12"}`}>
      <button
        type="button"
        onClick={() => set(value - step)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
        className={`grid ${compact ? "size-10" : "size-12"} place-items-center rounded-full text-ink hover:bg-mist disabled:opacity-40`}
      >
        <Minus className="size-4" />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_QUANTITY}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        aria-label="Quantity"
        className={`${compact ? "w-16 text-sm" : "w-24"} bg-transparent text-center font-semibold tabular-nums outline-none`}
      />
      <button
        type="button"
        onClick={() => set(value + step)}
        aria-label="Increase quantity"
        className={`grid ${compact ? "size-10" : "size-12"} place-items-center rounded-full text-ink hover:bg-mist`}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function UnitSelect({
  value,
  onChange,
  className = "",
}: {
  value: QuantityUnit;
  onChange: (u: QuantityUnit) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as QuantityUnit)}
      aria-label="Quantity unit"
      className={`field h-12 w-auto rounded-full py-0 pr-9 ${className}`}
    >
      {quantityUnits.map((u) => (
        <option key={u} value={u}>
          {u}
        </option>
      ))}
    </select>
  );
}

export function EnquiryPanel({ product }: { product: MedicineSummary }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1000);
  const [unit, setUnit] = useState<QuantityUnit>("Units");

  return (
    <div className="rounded-3xl border border-line bg-mist/70 p-5 sm:p-6">
      <label htmlFor="detail-qty" className="text-sm font-semibold">
        Required quantity
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <QuantityStepper id="detail-qty" value={qty} onChange={setQty} />
        <UnitSelect value={unit} onChange={setUnit} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setQty(p)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              qty === p ? "border-brand-light bg-sage text-brand-dark" : "border-line bg-white text-muted hover:text-ink"
            }`}
          >
            {p.toLocaleString("en-US")}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <AddToEnquiryButton product={product} quantity={qty} unit={unit} size="lg" label="Add to Enquiry Cart" />
        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            const result = add(product, qty, unit);
            notifyAdd(result, product.name);
            if (result !== "full") router.push("/cart");
          }}
        >
          <FileText className="size-4" /> Request Bulk Quotation
        </Button>
      </div>
      <div className="mt-3">
        <InCartHint id={product.id} />
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        No payment is taken online. Our team will confirm pricing, availability, MOQ and export feasibility for your
        destination via WhatsApp.
      </p>
    </div>
  );
}
