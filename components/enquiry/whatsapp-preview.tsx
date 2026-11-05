"use client";

import { useState } from "react";
import { ArrowLeft, Check, Copy, Info, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/layout/social-icons";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import type { GeneratedEnquiry } from "./enquiry-form";

export function WhatsAppPreview({ enquiry, onBack }: { enquiry: GeneratedEnquiry; onBack: () => void }) {
  const [text, setText] = useState(enquiry.message);
  const [copied, setCopied] = useState(false);
  const [opened, setOpened] = useState(false);
  const clear = useCart((s) => s.clear);

  const href = enquiry.whatsappBase ? `${enquiry.whatsappBase}?text=${encodeURIComponent(text)}` : null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Message copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy automatically — select the text and copy it manually.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl bg-sage/70 p-4 text-sm text-brand-dark">
        {enquiry.source === "ai" ? (
          <Sparkles className="mt-0.5 size-4 shrink-0" />
        ) : (
          <Info className="mt-0.5 size-4 shrink-0" />
        )}
        <p className="leading-relaxed">
          {enquiry.source === "ai"
            ? "Your enquiry has been formatted into a professional message. Every product, quantity and detail has been checked against what you entered."
            : "Your enquiry has been prepared with our standard message template."}{" "}
          Review or edit it below, then open WhatsApp and press <strong>Send</strong>.
        </p>
      </div>

      {typeof enquiry.verifiedProducts === "number" &&
        typeof enquiry.totalProducts === "number" &&
        enquiry.verifiedProducts < enquiry.totalProducts && (
          <p className="text-xs text-muted">
            {enquiry.verifiedProducts} of {enquiry.totalProducts} products were re-checked against the live catalogue;
            the rest use the details saved in your cart.
          </p>
        )}

      <div className="overflow-hidden rounded-3xl border border-line">
        <div className="flex items-center gap-3 bg-[#f0f5ef] px-5 py-3">
          <span className="grid size-9 place-items-center rounded-full bg-[#25D366] text-white">
            <WhatsAppIcon className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Message preview</p>
            <p className="text-xs text-muted">{text.length.toLocaleString("en-US")} characters</p>
          </div>
        </div>
        <label htmlFor="wa-message" className="sr-only">
          WhatsApp message
        </label>
        <textarea
          id="wa-message"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 6000))}
          rows={16}
          className="block w-full resize-y bg-[#fbfdfb] px-5 py-4 font-mono text-[0.82rem] leading-relaxed text-ink outline-none"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpened(true)}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 text-base font-semibold text-[#0b3d1f] transition-colors hover:bg-[#1fbe5b]"
          >
            <WhatsAppIcon className="size-5" /> Open WhatsApp to Send
          </a>
        ) : (
          <p className="text-sm text-danger">WhatsApp is not configured. Please copy the message and contact us.</p>
        )}
        <Button variant="outline" size="lg" onClick={copy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />} Copy message
        </Button>
        <Button variant="ghost" size="lg" onClick={onBack}>
          <ArrowLeft className="size-4" /> Edit details
        </Button>
      </div>

      {opened && (
        <div className="rounded-2xl border border-line bg-mist p-5">
          <p className="text-sm font-semibold">Did you press Send in WhatsApp?</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Your enquiry is only delivered once you send it. If WhatsApp didn&apos;t open, use “Copy message” and paste
            it into a chat with us. Your cart stays saved until you clear it.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => {
              clear();
              toast.success("Enquiry cart cleared");
            }}
          >
            <RotateCcw className="size-4" /> Yes — clear my cart
          </Button>
        </div>
      )}
    </div>
  );
}
