"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { businessConfig, businessTypes } from "@/config/business";
import { countries } from "@/lib/countries";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { buildTemplateMessage } from "@/lib/enquiry/template";
import { customerSchema, enquirySchema, issuesToFieldErrors, type CustomerInput } from "@/lib/validations/enquiry";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface GeneratedEnquiry {
  message: string;
  source: "ai" | "template" | "local";
  whatsappBase: string | null;
  verifiedProducts?: number;
  totalProducts?: number;
}

type FieldName = keyof CustomerInput;

const FIELDS: Array<{
  name: FieldName;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  half?: boolean;
  hint?: string;
}> = [
  { name: "companyName", label: "Company name", placeholder: "ABC Pharmaceuticals LLC", autoComplete: "organization", half: true },
  { name: "contactPerson", label: "Contact person", placeholder: "Full name", autoComplete: "name", half: true },
  { name: "email", label: "Business email", type: "email", placeholder: "procurement@company.com", autoComplete: "email", half: true },
  {
    name: "whatsapp",
    label: "WhatsApp number",
    type: "tel",
    placeholder: "+971 50 123 4567",
    autoComplete: "tel",
    half: true,
    hint: "Include your country code.",
  },
  { name: "country", label: "Country", placeholder: "Start typing…", autoComplete: "country-name", half: true },
];

export function EnquiryForm({ onBack, onGenerated }: { onBack: () => void; onGenerated: (g: GeneratedEnquiry) => void }) {
  const items = useCart((s) => s.items);
  const message = useCart((s) => s.message);
  const draft = useCart((s) => s.customer);
  const setDraft = useCart((s) => s.setCustomer);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const value = (k: FieldName) => (draft[k] as string | undefined) ?? "";
  const update = (k: FieldName, v: string) => {
    const next = { ...draft, [k]: v };
    setDraft(next);
    if (touched[k]) validate(next, k);
  };

  function validate(data: Partial<CustomerInput>, only?: FieldName) {
    const r = customerSchema.safeParse(data);
    const all = r.success ? {} : issuesToFieldErrors(r.error.issues);
    if (only) {
      setErrors((e) => {
        const n = { ...e };
        if (all[only]) n[only] = all[only];
        else delete n[only];
        return n;
      });
    } else {
      setErrors(all);
    }
    return r;
  }

  const blur = (k: FieldName) => {
    setTouched((t) => ({ ...t, [k]: true }));
    validate(draft, k);
  };

  const buildPayload = () => ({
    customer: draft,
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      notes: i.notes,
      composition: i.composition,
      strength: i.strength,
      dosageForm: i.dosageForm,
      manufacturer: i.manufacturer,
      packaging: i.packaging,
    })),
    message,
    website: honeypot,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const all = Object.fromEntries(FIELDS.map((f) => [f.name, true]));
    setTouched({ ...all, businessType: true, shippingDestination: true });
    const r = validate(draft);
    if (!r.success) {
      toast.error("Please complete the highlighted fields");
      const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    const payload = buildPayload();
    setSubmitting(true);
    try {
      const res = await apiFetch<GeneratedEnquiry>("/api/enquiry/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      onGenerated(res);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "validation" && err.fields) {
        const fieldErrors: Record<string, string> = {};
        for (const [k, v] of Object.entries(err.fields)) fieldErrors[k.replace(/^customer\./, "")] = v;
        setErrors(fieldErrors);
        setFormError(err.message);
        return;
      }
      // Never lose the enquiry: build the standard message locally if the server is unreachable.
      const parsed = enquirySchema.safeParse(payload);
      const base = buildWhatsAppUrl(businessConfig.whatsappNumber);
      if (parsed.success && base) {
        onGenerated({
          message: buildTemplateMessage(parsed.data, businessConfig.companyName),
          source: "local",
          whatsappBase: base,
        });
        toast.message("Prepared your enquiry with our standard template", {
          description: "The message service was unavailable, but your details are complete.",
        });
      } else {
        setFormError(err instanceof Error ? err.message : "We couldn't prepare your enquiry. Please retry.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldProps = (name: string) => ({
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
            <label htmlFor={f.name} className="mb-1.5 block text-sm font-medium">
              {f.label} <span className="text-danger">*</span>
            </label>
            <input
              id={f.name}
              name={f.name}
              type={f.type ?? "text"}
              value={value(f.name)}
              onChange={(e) => update(f.name, e.target.value)}
              onBlur={() => blur(f.name)}
              placeholder={f.placeholder}
              autoComplete={f.autoComplete}
              list={f.name === "country" ? "country-list" : undefined}
              className="field"
              {...fieldProps(f.name)}
            />
            {errors[f.name] ? (
              <p id={`${f.name}-error`} className="mt-1.5 text-xs text-danger">
                {errors[f.name]}
              </p>
            ) : (
              f.hint && <p className="mt-1.5 text-xs text-muted">{f.hint}</p>
            )}
          </div>
        ))}
        <datalist id="country-list">
          {countries.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        <div>
          <label htmlFor="businessType" className="mb-1.5 block text-sm font-medium">
            Business type <span className="text-danger">*</span>
          </label>
          <select
            id="businessType"
            value={value("businessType")}
            onChange={(e) => update("businessType", e.target.value)}
            onBlur={() => blur("businessType")}
            className={cn("field", !value("businessType") && "text-muted")}
            {...fieldProps("businessType")}
          >
            <option value="" disabled>
              Select…
            </option>
            {businessTypes.map((b) => (
              <option key={b} value={b} className="text-ink">
                {b}
              </option>
            ))}
          </select>
          {errors.businessType && (
            <p id="businessType-error" className="mt-1.5 text-xs text-danger">
              {errors.businessType}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label htmlFor="shippingDestination" className="block text-sm font-medium">
              Shipping destination <span className="text-danger">*</span>
            </label>
            {value("country") && value("shippingDestination") !== value("country") && (
              <button
                type="button"
                onClick={() => update("shippingDestination", value("country"))}
                className="text-xs font-medium text-brand hover:text-brand-dark"
              >
                Same as country
              </button>
            )}
          </div>
          <input
            id="shippingDestination"
            value={value("shippingDestination")}
            onChange={(e) => update("shippingDestination", e.target.value)}
            onBlur={() => blur("shippingDestination")}
            placeholder="City / port and country, e.g. Jebel Ali, United Arab Emirates"
            className="field"
            {...fieldProps("shippingDestination")}
          />
          {errors.shippingDestination && (
            <p id="shippingDestination-error" className="mt-1.5 text-xs text-danger">
              {errors.shippingDestination}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="additionalRequirements" className="mb-1.5 block text-sm font-medium">
            Additional requirements <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="additionalRequirements"
            rows={4}
            maxLength={1500}
            value={value("additionalRequirements")}
            onChange={(e) => update("additionalRequirements", e.target.value)}
            placeholder="Export documentation, labelling, packaging, Incoterms, delivery timeline, regulatory paperwork…"
            className="field resize-y"
            {...fieldProps("additionalRequirements")}
          />
          {errors.additionalRequirements && (
            <p id="additionalRequirements-error" className="mt-1.5 text-xs text-danger">
              {errors.additionalRequirements}
            </p>
          )}
        </div>

        {/* Honeypot — hidden from people, tempting for bots. */}
        <div aria-hidden className="hidden">
          <label htmlFor="website">Website</label>
          <input id="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </div>
      </div>

      {formError && (
        <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {formError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="size-4" /> Back to cart
        </Button>
        <Button type="submit" size="lg" disabled={submitting || items.length === 0}>
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {submitting ? "Preparing your enquiry…" : "Submit Enquiry"}
        </Button>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        Submitting prepares a WhatsApp message to our team — nothing is sent until you press Send in WhatsApp. Your
        details are used only to respond to this enquiry.
      </p>
    </form>
  );
}
