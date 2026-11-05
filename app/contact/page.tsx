import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { businessConfig } from "@/config/business";
import { buildWhatsAppUrl, formatPhoneForDisplay } from "@/lib/whatsapp";
import { PageHeader } from "@/components/layout/page-header";
import { ContactForm } from "@/components/enquiry/contact-form";
import { WhatsAppIcon } from "@/components/layout/social-icons";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact",
  description: "Discuss pharmaceutical sourcing, bulk procurement and export requirements with the Pharmafitx team.",
};

export default function ContactPage() {
  const wa = buildWhatsAppUrl(businessConfig.whatsappNumber);
  const cards = [
    wa && {
      icon: WhatsAppIcon,
      label: "WhatsApp",
      value: formatPhoneForDisplay(businessConfig.whatsappNumber),
      href: wa,
      external: true,
    },
    businessConfig.email && { icon: Mail, label: "Email", value: businessConfig.email, href: `mailto:${businessConfig.email}` },
    businessConfig.phone && {
      icon: Phone,
      label: "Phone",
      value: businessConfig.phone,
      href: `tel:${businessConfig.phone.replace(/[^\d+]/g, "")}`,
    },
    businessConfig.address && { icon: MapPin, label: "Address", value: businessConfig.address },
    businessConfig.hours && { icon: Clock, label: "Business hours", value: businessConfig.hours },
  ].filter(Boolean) as Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    href?: string;
    external?: boolean;
  }>;

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Discuss your requirements"
        description="Tell us what you need to source, the volumes involved and where it's going. Our team will respond directly on WhatsApp."
        crumbs={[{ label: "Contact" }]}
      />
      <div className="container-page mt-12 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          {cards.map((c) => {
            const Icon = c.icon;
            const body = (
              <>
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sage text-brand">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-muted">{c.label}</span>
                  <span className="mt-0.5 block whitespace-pre-line break-words font-semibold text-ink">{c.value}</span>
                </span>
              </>
            );
            return c.href ? (
              <a
                key={c.label}
                href={c.href}
                target={c.external ? "_blank" : undefined}
                rel={c.external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-4 rounded-3xl border border-line bg-white p-5 transition-shadow hover:shadow-soft"
              >
                {body}
              </a>
            ) : (
              <div key={c.label} className="flex items-center gap-4 rounded-3xl border border-line bg-white p-5">
                {body}
              </div>
            );
          })}
          <div className="rounded-3xl bg-mist p-6">
            <h2 className="text-lg font-semibold">Sourcing specific products?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Use the enquiry cart to list medicines with quantities — we&apos;ll prepare a complete quotation request
              for you.
            </p>
            <ButtonLink href="/products" className="mt-5">
              Build a product enquiry
            </ButtonLink>
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8">
          <h2 className="text-xl font-semibold">Send us a message</h2>
          <p className="mb-6 mt-1 text-sm text-muted">General questions about procurement, export or partnerships.</p>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
