"use client";

import { useState } from "react";
import { businessConfig } from "@/config/business";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { sanitiseText } from "@/lib/validations/enquiry";
import { countries } from "@/lib/countries";
import { WhatsAppIcon } from "@/components/layout/social-icons";

/** General (non-product) enquiry → deterministic WhatsApp message. */
export function ContactForm() {
  const [form, setForm] = useState({ name: "", company: "", country: "", topic: "Bulk procurement", message: "" });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = sanitiseText(form.name);
    const company = sanitiseText(form.company);
    const message = sanitiseText(form.message, { multiline: true });
    if (name.length < 2 || company.length < 2 || message.length < 10) {
      setError("Please add your name, company and a short message (at least 10 characters).");
      return;
    }
    setError(null);
    const text = [
      `Hello ${businessConfig.companyName} Team,`,
      "",
      `*Topic:* ${form.topic}`,
      `*Name:* ${name}`,
      `*Company:* ${company}`,
      form.country ? `*Country:* ${sanitiseText(form.country)}` : null,
      "",
      message,
    ]
      .filter((l) => l !== null)
      .join("\n");
    const url = buildWhatsAppUrl(businessConfig.whatsappNumber, text);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!businessConfig.whatsappNumber) {
    return (
      <p className="rounded-2xl bg-amber-soft p-4 text-sm text-amber">
        The WhatsApp contact number has not been configured yet.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
      <div>
        <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium">Your name</label>
        <input id="c-name" value={form.name} onChange={set("name")} className="field" autoComplete="name" maxLength={80} />
      </div>
      <div>
        <label htmlFor="c-company" className="mb-1.5 block text-sm font-medium">Company</label>
        <input id="c-company" value={form.company} onChange={set("company")} className="field" autoComplete="organization" maxLength={120} />
      </div>
      <div>
        <label htmlFor="c-country" className="mb-1.5 block text-sm font-medium">Country</label>
        <input id="c-country" value={form.country} onChange={set("country")} list="c-countries" className="field" maxLength={60} />
        <datalist id="c-countries">
          {countries.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div>
        <label htmlFor="c-topic" className="mb-1.5 block text-sm font-medium">Topic</label>
        <select id="c-topic" value={form.topic} onChange={set("topic")} className="field">
          {["Bulk procurement", "Export & shipping", "Documentation", "Product sourcing", "Partnership", "Other"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-message" className="mb-1.5 block text-sm font-medium">Message</label>
        <textarea
          id="c-message"
          rows={5}
          value={form.message}
          onChange={set("message")}
          maxLength={1500}
          placeholder="Tell us about the products, volumes and destination you have in mind."
          className="field resize-y"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger sm:col-span-2">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">Opens WhatsApp with your message ready — press Send to deliver it.</p>
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 font-semibold text-[#0b3d1f] hover:bg-[#1fbe5b]"
        >
          <WhatsAppIcon className="size-5" /> Continue on WhatsApp
        </button>
      </div>
    </form>
  );
}
