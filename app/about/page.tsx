import type { Metadata } from "next";
import { ArrowRight, Boxes, FileCheck2, Globe2, Network, ShieldCheck, Truck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Pharmafitx is a B2B pharmaceutical procurement platform helping international buyers source medicines through direct, personalised quotations.",
};

const pillars = [
  {
    icon: Globe2,
    title: "Global pharmaceutical supply",
    text: "We work with healthcare businesses that source across borders, making it simple to shortlist products and describe exactly what is needed.",
  },
  {
    icon: Network,
    title: "International distribution",
    text: "Enquiries capture destination, packaging and documentation needs up front so our team can assess each market properly.",
  },
  {
    icon: Boxes,
    title: "Bulk procurement",
    text: "Multi-product, high-volume requests are combined into one structured enquiry with quantities and units for each line.",
  },
  {
    icon: ShieldCheck,
    title: "Quality assurance",
    text: "Product information is shown exactly as listed in the catalogue. Documentation and quality paperwork are discussed and shared per order where available.",
  },
  {
    icon: Truck,
    title: "Export assistance",
    text: "Our team discusses shipping arrangements, export paperwork and timelines directly with you once requirements are confirmed.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Pharmafitx"
        title="A simpler way to source pharmaceuticals across borders"
        description="Pharmafitx brings together a searchable pharmaceutical catalogue and direct, human quotation support for distributors, wholesalers, importers, pharmacies and hospitals."
        crumbs={[{ label: "About Us" }]}
      />

      <section className="container-page mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">Built around how B2B buyers actually work</h2>
        </Reveal>
        <Reveal delay={0.05} className="space-y-5 text-base leading-relaxed text-muted">
          <p>
            Pharmaceutical procurement is rarely a one-click purchase. Prices depend on volume, destination, packaging
            and documentation, and availability needs to be confirmed before anything is promised.
          </p>
          <p>
            That is why Pharmafitx has no checkout. You discover products, build a detailed enquiry, and send it to our
            team on WhatsApp. We respond personally with pricing, availability, export requirements and shipping
            arrangements for your market.
          </p>
          <p>
            Product data is supplied by DrugSetu, a pharmaceutical product information database maintained with
            manufacturers. We display that information as provided and never add unverified prices, stock levels or
            certifications.
          </p>
        </Reveal>
      </section>

      <section className="container-page mt-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.05}>
              <div className="h-full rounded-3xl border border-line bg-white p-7">
                <span className="grid size-12 place-items-center rounded-2xl bg-sage text-brand">
                  <Icon className="size-5" strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.25}>
            <div className="flex h-full flex-col justify-between rounded-3xl bg-brand p-7 text-white">
              <p className="font-display text-2xl font-semibold leading-snug text-white">
                Have a sourcing requirement?
              </p>
              <ButtonLink href="/contact" variant="secondary" className="mt-6 self-start bg-white">
                Talk to our team <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="compliance" className="container-page mt-20 scroll-mt-28">
        <div className="rounded-[2rem] bg-mist p-8 sm:p-12">
          <div className="flex items-center gap-3">
            <FileCheck2 className="size-6 text-brand" strokeWidth={1.7} />
            <h2 className="text-2xl font-semibold">Legal &amp; compliance</h2>
          </div>
          <div className="mt-6 grid gap-6 text-sm leading-relaxed text-muted md:grid-cols-2">
            <p>
              <strong className="text-ink">Regulated products.</strong> Pharmaceutical products are regulated goods.
              Product availability and export feasibility depend on the regulations of the destination country and on
              applicable licensing and registration requirements for both buyer and seller.
            </p>
            <p>
              <strong className="text-ink">Catalogue information.</strong> Product information is sourced from the
              DrugSetu catalogue for procurement reference only. It is not medical advice and may not reflect the
              latest manufacturer labelling.
            </p>
            <p>
              <strong className="text-ink">No online sales.</strong> This website does not sell products or process
              payments. Submitting an enquiry does not create an order; all terms are agreed directly in writing.
            </p>
            <p>
              <strong className="text-ink">Certifications.</strong> Certifications, licences and regulatory approvals
              are shared only when verified for a specific product and order. Please request any documentation you
              need in your enquiry.
            </p>
            <p className="md:col-span-2">
              <strong className="text-ink">Privacy.</strong> Enquiry details you enter are used to prepare your WhatsApp
              message and are stored only in your browser (to keep your cart) until you send them to us. They are
              processed by our server and an AI formatting service (Groq) solely to prepare the message.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
