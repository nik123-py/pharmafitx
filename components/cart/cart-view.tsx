"use client";

import { useState } from "react";
import { ArrowRight, ClipboardList, Lock, Trash2 } from "lucide-react";
import { useCart, useHydrated } from "@/store/cart";
import { ButtonLink, Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { EnquiryForm, type GeneratedEnquiry } from "@/components/enquiry/enquiry-form";
import { WhatsAppPreview } from "@/components/enquiry/whatsapp-preview";
import { cn } from "@/lib/utils/cn";
import { CartItems } from "./cart-items";

type Step = "cart" | "details" | "preview";

const STEPS: Array<{ id: Step; label: string }> = [
  { id: "cart", label: "Enquiry cart" },
  { id: "details", label: "Company details" },
  { id: "preview", label: "Send via WhatsApp" },
];

function Stepper({ step }: { step: Step }) {
  const idx = STEPS.findIndex((s) => s.id === step);
  return (
    <ol className="flex items-center gap-2 overflow-x-auto pb-1 text-sm">
      {STEPS.map((s, i) => (
        <li key={s.id} className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "grid size-7 place-items-center rounded-full text-xs font-semibold",
              i < idx ? "bg-brand text-white" : i === idx ? "bg-ink text-white" : "bg-mist text-muted",
            )}
          >
            {i + 1}
          </span>
          <span className={cn("font-medium", i === idx ? "text-ink" : "hidden text-muted sm:inline")}>{s.label}</span>
          {i < STEPS.length - 1 && <span className="mx-1 h-px w-4 bg-line sm:w-10" />}
        </li>
      ))}
    </ol>
  );
}

export function CartView() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const message = useCart((s) => s.message);
  const setMessage = useCart((s) => s.setMessage);
  const clear = useCart((s) => s.clear);
  const [step, setStep] = useState<Step>("cart");
  const [generated, setGenerated] = useState<GeneratedEnquiry | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const go = (s: Step) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="skeleton h-80 rounded-3xl" />
        <div className="skeleton h-64 rounded-3xl" />
      </div>
    );
  }

  if (items.length === 0 && step !== "preview") {
    return (
      <EmptyState
        icon={<ClipboardList className="size-6" strokeWidth={1.6} />}
        title="Your enquiry cart is empty"
        description="Browse the catalogue and add the medicines you need. You can set quantities and requirements for each product before requesting a quotation."
        action={
          <ButtonLink href="/products" size="lg">
            Explore Products <ArrowRight className="size-4" />
          </ButtonLink>
        }
      />
    );
  }

  const totalLines = items.length;
  const units = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.unit] = (acc[i.unit] ?? 0) + i.quantity;
    return acc;
  }, {});

  return (
    <div>
      <Stepper step={step} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:gap-8">
        <div className="rounded-3xl border border-line bg-white p-5 sm:p-8">
          {step === "cart" && (
            <>
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Products ({totalLines})</h2>
                {confirmClear ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted">Clear all?</span>
                    <button
                      onClick={() => {
                        clear();
                        setConfirmClear(false);
                      }}
                      className="font-semibold text-danger hover:underline"
                    >
                      Yes, clear
                    </button>
                    <button onClick={() => setConfirmClear(false)} className="font-medium text-muted hover:text-ink">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-danger"
                  >
                    <Trash2 className="size-4" /> Clear cart
                  </button>
                )}
              </div>
              <CartItems />
              <div className="mt-8 border-t border-line pt-6">
                <label htmlFor="enquiry-message" className="text-sm font-semibold">
                  Overall enquiry message <span className="font-normal text-muted">(optional)</span>
                </label>
                <textarea
                  id="enquiry-message"
                  rows={4}
                  maxLength={1500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Anything our team should know about this enquiry — timelines, recurring orders, tender references…"
                  className="field mt-2 resize-y"
                />
                <p className="mt-1 text-right text-[0.7rem] text-muted">{message.length}/1500</p>
              </div>
            </>
          )}
          {step === "details" && (
            <>
              <h2 className="text-xl font-semibold">Your company details</h2>
              <p className="mb-6 mt-1 text-sm text-muted">
                We use these details to prepare your quotation request. Fields marked * are required.
              </p>
              <EnquiryForm
                onBack={() => go("cart")}
                onGenerated={(g) => {
                  setGenerated(g);
                  go("preview");
                }}
              />
            </>
          )}
          {step === "preview" && generated && (
            <>
              <h2 className="mb-6 text-xl font-semibold">Review &amp; send your enquiry</h2>
              <WhatsAppPreview enquiry={generated} onBack={() => go("details")} />
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl bg-mist p-6 sm:p-7">
            <h2 className="text-lg font-semibold">Enquiry summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Products</dt>
                <dd className="font-semibold">{totalLines}</dd>
              </div>
              {Object.entries(units).map(([unit, qty]) => (
                <div key={unit} className="flex justify-between gap-4">
                  <dt className="text-muted">Total {unit.toLowerCase()}</dt>
                  <dd className="font-semibold tabular-nums">{qty.toLocaleString("en-US")}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t border-line pt-3">
                <dt className="text-muted">Pricing</dt>
                <dd className="text-right font-medium text-brand-dark">Quoted by our team</dd>
              </div>
            </dl>
            {step === "cart" && (
              <Button size="lg" className="mt-6 w-full" onClick={() => go("details")} disabled={!items.length}>
                Proceed to Enquiry <ArrowRight className="size-4" />
              </Button>
            )}
            <ul className="mt-6 space-y-2.5 text-xs leading-relaxed text-muted">
              <li className="flex gap-2">
                <Lock className="mt-0.5 size-3.5 shrink-0 text-brand" /> No online payment — this is a quotation request.
              </li>
              <li className="flex gap-2">
                <Lock className="mt-0.5 size-3.5 shrink-0 text-brand" /> Your cart is saved on this device.
              </li>
              <li className="flex gap-2">
                <Lock className="mt-0.5 size-3.5 shrink-0 text-brand" /> Availability and export feasibility depend on
                destination regulations and licensing.
              </li>
            </ul>
          </div>
          {step === "cart" && (
            <ButtonLink href="/products" variant="ghost" className="mt-3 w-full">
              Continue browsing
            </ButtonLink>
          )}
        </aside>
      </div>
    </div>
  );
}
