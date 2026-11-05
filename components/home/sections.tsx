import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  FileText,
  Globe2,
  Handshake,
  MessageCircle,
  PackageSearch,
  Plane,
  ScrollText,
  SearchCheck,
  ShieldCheck,
  Ship,
  ClipboardList,
  Truck,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ErrorState, SectionHeading } from "@/components/ui/states";
import { CategoryCard } from "@/components/categories/category-card";
import { ProductCard, ProductCardSkeleton } from "@/components/products/product-card";
import { DrugsetuError, drugsetuErrorMessages, getAllCategories, getFeaturedProducts } from "@/services/drugsetu";
import { WhatsAppIcon } from "@/components/layout/social-icons";

/* ----------------------------- Trust strip ----------------------------- */

const trust = [
  { icon: Globe2, title: "Global B2B Supply", text: "Built for buyers sourcing across borders." },
  { icon: Boxes, title: "Bulk Procurement", text: "Multi-product, high-volume enquiries." },
  { icon: Plane, title: "International Enquiries", text: "Destination-aware quotation requests." },
  { icon: Handshake, title: "Direct Business Assistance", text: "Speak with our team on WhatsApp." },
];

export function TrustStrip() {
  return (
    <section aria-label="What we offer" className="container-page">
      <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {trust.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4 bg-white p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sage text-brand">
              <Icon className="size-5" strokeWidth={1.7} />
            </span>
            <div>
              <h3 className="text-[0.98rem] font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Categories ----------------------------- */

export async function CategoriesSection() {
  let error: string | null = null;
  let categories: Awaited<ReturnType<typeof getAllCategories>> = [];
  try {
    categories = await getAllCategories();
  } catch (e) {
    error = e instanceof DrugsetuError ? drugsetuErrorMessages[e.code] : "Categories are unavailable right now.";
  }
  const shown = categories.slice(0, 8);

  return (
    <section className="container-page mt-24 sm:mt-28">
      <SectionHeading
        eyebrow="Product categories"
        title={
          <>
            Browse by <span className="text-brand">therapeutic area</span>
          </>
        }
        description="Categories are drawn live from our pharmaceutical catalogue partner, DrugSetu."
        action={
          <ButtonLink href="/categories" variant="outline" className="self-start md:self-auto">
            All categories <ArrowRight className="size-4" />
          </ButtonLink>
        }
      />
      {error ? (
        <ErrorState className="mt-10" title="Categories unavailable" description={error} />
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.04}>
              <CategoryCard category={c} featured={i === 0} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

export function CategoriesSkeleton() {
  return (
    <section className="container-page mt-24 sm:mt-28">
      <div className="skeleton h-4 w-40" />
      <div className="skeleton mt-4 h-10 w-80 max-w-full" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-52 rounded-3xl" />
        ))}
      </div>
    </section>
  );
}

/* --------------------------- Featured products -------------------------- */

export async function FeaturedProducts() {
  let error: string | null = null;
  let products: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  try {
    products = await getFeaturedProducts(8);
  } catch (e) {
    error = e instanceof DrugsetuError ? drugsetuErrorMessages[e.code] : "Products are unavailable right now.";
  }

  return (
    <section className="mt-24 bg-mist py-20 sm:mt-28 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="From the catalogue"
          title="Featured medicines"
          description="Specifications shown exactly as listed in the catalogue. Pricing and availability are quoted individually."
          action={
            <ButtonLink href="/products" className="self-start md:self-auto">
              View all products <ArrowRight className="size-4" />
            </ButtonLink>
          }
        />
        {error ? (
          <ErrorState className="mt-10 bg-white" title="Products unavailable" description={error} />
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.05}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function FeaturedSkeleton() {
  return (
    <section className="mt-24 bg-mist py-20 sm:mt-28 sm:py-24">
      <div className="container-page">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton mt-4 h-10 w-72 max-w-full" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Why Pharmafitx ---------------------------- */

const why = [
  {
    icon: SearchCheck,
    title: "Pharmaceutical sourcing",
    text: "Search a live catalogue by brand, generic composition or manufacturer and shortlist exactly what you need.",
  },
  {
    icon: Globe2,
    title: "International procurement",
    text: "Enquiries capture your country, shipping destination and documentation needs from the very first message.",
  },
  {
    icon: Boxes,
    title: "Bulk enquiry support",
    text: "Combine many products, quantities and units into one structured quotation request.",
  },
  {
    icon: MessageCircle,
    title: "Direct business communication",
    text: "No checkout and no middle layer — your request goes straight to our team on WhatsApp.",
  },
  {
    icon: FileText,
    title: "Export-oriented assistance",
    text: "Discuss packaging, documentation and shipping arrangements for your destination market.",
  },
];

export function WhySection() {
  return (
    <section className="container-page mt-24 sm:mt-28">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            eyebrow="Why Pharmafitx"
            title={
              <>
                Procurement that feels <span className="text-brand">personal</span>, at any scale.
              </>
            }
            description="We combine a searchable pharmaceutical catalogue with direct, human quotation support — so every enquiry is reviewed and priced for your business."
          />
          <div className="mt-8 rounded-3xl bg-sage p-6">
            <p className="text-sm leading-relaxed text-brand-dark">
              <strong className="font-semibold">Transparent by design.</strong> We never display unverified prices,
              stock levels or certifications online. Everything commercial is confirmed with you directly.
            </p>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {why.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.05} className={i === 0 ? "sm:col-span-2" : undefined}>
              <div className="h-full rounded-3xl border border-line bg-white p-7 transition-shadow hover:shadow-soft">
                <span className="grid size-12 place-items-center rounded-2xl bg-mist text-brand">
                  <Icon className="size-5" strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- International export ------------------------- */

function RouteMap() {
  // Abstract dotted globe with connecting routes — illustrative, not a coverage map.
  const dots: Array<[number, number]> = [];
  for (let y = 0; y < 13; y++) {
    for (let x = 0; x < 22; x++) {
      const cx = 20 + x * 22;
      const cy = 20 + y * 22;
      const dx = (cx - 251) / 240;
      const dy = (cy - 152) / 150;
      if (dx * dx + dy * dy < 1 && (x * 7 + y * 3) % 5 !== 0) dots.push([cx, cy]);
    }
  }
  return (
    <svg viewBox="0 0 502 304" className="h-auto w-full" aria-hidden>
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.6" fill="#8BBE91" opacity="0.45" />
      ))}
      <g fill="none" stroke="#4F8B61" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round">
        <path d="M120 180 Q190 70 300 110" />
        <path d="M300 110 Q370 140 410 220" />
        <path d="M300 110 Q330 40 420 70" />
        <path d="M120 180 Q200 250 290 230" />
      </g>
      {[
        [120, 180],
        [300, 110],
        [410, 220],
        [420, 70],
        [290, 230],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="12" fill="#4F8B61" opacity="0.15" />
          <circle cx={cx} cy={cy} r="5.5" fill={i === 1 ? "#4F8B61" : "#FFFFFF"} stroke="#4F8B61" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

const exportPoints = [
  { icon: Ship, title: "Destination-aware requests", text: "Every enquiry records the destination so feasibility can be assessed early." },
  { icon: ScrollText, title: "Documentation enquiries", text: "Ask about the paperwork your import process requires." },
  { icon: Truck, title: "Packaging & shipping", text: "Share packaging and logistics preferences with your request." },
  { icon: ShieldCheck, title: "Regulation first", text: "Supply is subject to destination regulations and applicable licensing." },
];

export function ExportSection() {
  return (
    <section className="container-page mt-24 sm:mt-28">
      <div className="relative overflow-hidden rounded-[2.25rem] bg-sage px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
        <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-white/40" />
        <div aria-hidden className="absolute -bottom-32 left-1/3 size-96 rounded-full bg-sage-strong/60" />
        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">International export</p>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.1] sm:text-4xl md:text-5xl">
              Connecting Pharmaceutical Supply Across Borders.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/70 sm:text-lg">
              Pharmafitx helps international distributors, importers and institutions shortlist products and send
              complete, structured sourcing enquiries — so our team can respond with a quotation tailored to your
              market.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {exportPoints.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl bg-white/70 p-4 backdrop-blur">
                  <Icon className="size-5 text-brand" strokeWidth={1.7} />
                  <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{text}</p>
                </div>
              ))}
            </div>
            <ButtonLink href="/contact" size="lg" className="mt-9">
              Discuss Your Requirements <ArrowRight className="size-4" />
            </ButtonLink>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-[2rem] bg-white/80 p-6 shadow-lift backdrop-blur sm:p-8">
              <RouteMap />
              <div className="mt-6 flex flex-wrap gap-2">
                {["Middle East", "Africa", "Southeast Asia", "CIS", "Latin America"].map((r) => (
                  <span key={r} className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink/80">
                    {r}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted">
                Regions shown are examples of where enquiries can originate. Export feasibility is confirmed per order.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Process ------------------------------- */

const steps = [
  { icon: PackageSearch, title: "Explore Products", text: "Search the catalogue by brand, generic name or manufacturer." },
  { icon: ClipboardList, title: "Build Your Enquiry", text: "Add medicines, quantities, units and product-specific notes." },
  { icon: WhatsAppIcon, title: "Submit via WhatsApp", text: "We prepare a structured message — you review and press send." },
  { icon: Handshake, title: "Receive a Personalised Quotation", text: "Our team replies with pricing, availability and export terms." },
];

export function ProcessSection() {
  return (
    <section className="container-page mt-24 sm:mt-28">
      <SectionHeading
        align="center"
        eyebrow="B2B procurement process"
        title="From shortlist to quotation in four steps"
      />
      <div className="relative mt-14">
        <div aria-hidden className="absolute left-[12%] right-[12%] top-9 hidden border-t-2 border-dashed border-sage-strong lg:block" />
        <ol className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="h-full">
            <Reveal delay={i * 0.06} className="h-full">
            <div className="relative flex h-full flex-col items-center rounded-3xl border border-line bg-white px-6 pb-8 text-center">
              <span className="relative -mt-0 grid size-[4.5rem] place-items-center rounded-full border-8 border-white bg-sage text-brand">
                <Icon className="size-6" strokeWidth={1.7} />
              </span>
              <span className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand">Step {i + 1}</span>
              <h3 className="mt-2 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </div>
            </Reveal>
          </li>
        ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------- CTA band ------------------------------ */

export function CtaBand() {
  return (
    <section className="container-page mt-24 sm:mt-28">
      <div className="flex flex-col items-start justify-between gap-8 rounded-[2.25rem] border border-line bg-white p-8 shadow-soft sm:p-12 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">Ready to source in bulk?</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Build your enquiry in minutes. There is no payment online — our team confirms pricing, availability and
            export terms with you directly.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <ButtonLink href="/products" size="lg">
            Start an Enquiry
          </ButtonLink>
          <Link
            href="/contact"
            className="inline-flex h-13 items-center justify-center rounded-full px-6 text-base font-medium text-brand-dark hover:bg-mist"
          >
            Talk to our team
          </Link>
        </div>
      </div>
    </section>
  );
}
