import { ArrowRight, Globe2, PackageCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { HeroIllustration } from "./hero-illustration";
import { HeroSearch } from "./hero-search";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-gradient-to-b from-mist to-white" />
      <div className="container-page grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-24 lg:pt-16">
        <Reveal>
          <p className="eyebrow">
            <span className="size-1.5 rounded-full bg-brand" />
            Global Pharmaceutical Supply
          </p>
          <h1 className="mt-5 text-[2.6rem] font-medium leading-[1.04] sm:text-6xl lg:text-[4.4rem]">
            Healthcare Supply,
            <br />
            <span className="text-brand">Without</span> Boundaries.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Connecting healthcare businesses worldwide with reliable pharmaceutical sourcing, bulk procurement, and
            streamlined international supply.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/products" size="lg">
              Explore Products <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/cart" size="lg" variant="outline">
              Request a Bulk Quote
            </ButtonLink>
          </div>
          <HeroSearch />
        </Reveal>

        <Reveal delay={0.1} className="relative mx-auto w-full max-w-[34rem]">
          <HeroIllustration className="h-auto w-full" />
          <div className="absolute left-0 top-[12%] hidden items-center gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-lift backdrop-blur sm:flex">
            <span className="grid size-10 place-items-center rounded-xl bg-sage text-brand">
              <Globe2 className="size-5" strokeWidth={1.7} />
            </span>
            <div>
              <p className="text-sm font-semibold">International enquiries</p>
              <p className="text-xs text-muted">Buyers across borders</p>
            </div>
          </div>
          <div className="absolute bottom-[8%] right-0 hidden items-center gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-lift backdrop-blur sm:flex">
            <span className="grid size-10 place-items-center rounded-xl bg-brand text-white">
              <PackageCheck className="size-5" strokeWidth={1.7} />
            </span>
            <div>
              <p className="text-sm font-semibold">Bulk quotations</p>
              <p className="text-xs text-muted">Personalised via WhatsApp</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
