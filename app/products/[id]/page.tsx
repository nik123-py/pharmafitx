import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, Building2, CheckCircle2, Info, ShieldAlert, XCircle } from "lucide-react";
import { DrugsetuError, drugsetuErrorMessages, getProduct } from "@/services/drugsetu";
import { displayCategoryName, toSummary } from "@/services/drugsetu/normalizers";
import { isProductId } from "@/services/drugsetu/ids";
import type { Medicine, SafetyNote } from "@/types/medicine";
import { Gallery } from "@/components/products/gallery";
import { EnquiryPanel } from "@/components/products/enquiry-panel";
import { ErrorState } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export const revalidate = 21600;

type Props = { params: Promise<{ id: string }> };

async function load(id: string): Promise<{ product?: Medicine; error?: string }> {
  if (!isProductId(id)) notFound();
  try {
    return { product: await getProduct(id) };
  } catch (e) {
    if (e instanceof DrugsetuError && e.code === "not_found") notFound();
    return { error: e instanceof DrugsetuError ? drugsetuErrorMessages[e.code] : "Product unavailable." };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isProductId(id)) return { title: "Product not found" };
  try {
    const p = await getProduct(id);
    return {
      title: p.name,
      description: [p.composition, p.manufacturer, p.dosageForm].filter(Boolean).join(" · ") || undefined,
      openGraph: p.image ? { images: [p.image] } : undefined,
    };
  } catch {
    return { title: "Product" };
  }
}

const severityStyle: Record<string, { cls: string; icon: typeof Info; label: string }> = {
  safe: { cls: "bg-sage text-brand-dark", icon: CheckCircle2, label: "Safe" },
  caution: { cls: "bg-amber-soft text-amber", icon: AlertTriangle, label: "Caution" },
  unsafe: { cls: "bg-danger-soft text-danger", icon: XCircle, label: "Unsafe" },
  consult_doctor: { cls: "bg-amber-soft text-amber", icon: ShieldAlert, label: "Consult a doctor" },
};

function SafetyCard({ note }: { note: SafetyNote }) {
  const s = severityStyle[note.severity] ?? { cls: "bg-mist text-muted", icon: Info, label: note.severity.replace(/_/g, " ") };
  const Icon = s.icon;
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold">{note.label}</h4>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold capitalize", s.cls)}>
          <Icon className="size-3.5" /> {s.label}
        </span>
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-muted">{note.description}</p>
    </div>
  );
}

function Spec({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl bg-white p-4">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold leading-snug text-ink">{value}</dd>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-8 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const { product: p, error } = await load(id);

  if (!p) {
    return (
      <div className="container-page py-16">
        <ErrorState
          title="This product couldn't be loaded"
          description={error}
          action={
            <ButtonLink href={`/products/${id}`} variant="outline">
              Retry
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const summary = toSummary(p);
  const hasClinical =
    p.usage || p.benefits || p.howItWorks || p.sideEffects.length || p.safety.length || p.missedDose || p.faq.length;

  return (
    <div className="container-page pb-8 pt-8 sm:pt-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/products" className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-brand-dark">
          <ArrowLeft className="size-4" /> Products
        </Link>
        {p.categoryName && p.categoryId && (
          <>
            <span>/</span>
            <Link href={`/categories/${p.categoryId}`} className="hover:text-ink">
              {displayCategoryName(p.categoryName)}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Gallery images={p.images} name={p.name} dosageForm={p.dosageForm} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sage px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-dark">
              {p.type === "drug" ? "Medicine" : "Healthcare product"}
            </span>
            {p.categoryName && (
              <span className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted">
                {displayCategoryName(p.categoryName)}
              </span>
            )}
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">{p.name}</h1>
          {p.composition && (
            <p className="mt-3 text-base leading-relaxed text-muted">
              <span className="font-medium text-ink">Composition:</span> {p.composition}
            </p>
          )}
          {p.manufacturer && (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted">
              <Building2 className="size-4 text-brand" strokeWidth={1.8} />
              Marketed by <span className="font-medium text-ink">{p.manufacturer}</span>
            </p>
          )}

          <dl className="mt-7 grid grid-cols-2 gap-2 rounded-3xl bg-mist p-2 sm:grid-cols-3">
            <Spec label="Strength" value={p.strength} />
            <Spec label="Dosage form" value={p.dosageForm} />
            <Spec label="Pack" value={p.packaging} />
            <Spec label="Manufacturer" value={p.manufacturingCompany} />
            <Spec label="Chemical class" value={p.chemicalClass} />
            <Spec label="Action class" value={p.actionClass} />
            <Spec label="Habit forming" value={p.habitForming} />
            {p.ingredients.length > 1 && <Spec label="Active ingredients" value={String(p.ingredients.length)} />}
          </dl>

          {p.packagings.length > 1 && (
            <div className="mt-5">
              <p className="text-sm font-semibold">Available packaging</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {p.packagings.map((pk, i) => (
                  <li key={i} className="rounded-full border border-line px-3 py-1.5 text-xs text-ink/80">
                    {pk.packaging ?? [pk.package, pk.quantity].filter(Boolean).join(" · ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-7">
            <EnquiryPanel product={summary} />
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Block title="Product overview">
            {p.description ? (
              <div className="prose-pf">
                <p>{p.description}</p>
              </div>
            ) : (
              <p className="text-sm text-muted">No description is listed for this product in the catalogue.</p>
            )}
          </Block>
          {p.ingredients.length > 0 && (
            <Block title="Composition">
              <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {p.ingredients.map((ing) => (
                  <li key={ing.name} className="flex items-center justify-between gap-4 bg-white px-5 py-3.5 text-sm">
                    <span className="font-medium">{ing.name}</span>
                    <span className="text-muted">{ing.strength ?? "Strength not listed"}</span>
                  </li>
                ))}
              </ul>
            </Block>
          )}
          {p.usage && (
            <Block title="Uses">
              <p className="text-sm leading-relaxed text-muted">{p.usage}</p>
            </Block>
          )}
          {p.benefits && (
            <Block title="Benefits">
              <p className="text-sm leading-relaxed text-muted">{p.benefits}</p>
            </Block>
          )}
          {p.howItWorks && (
            <Block title="How it works">
              <p className="text-sm leading-relaxed text-muted">{p.howItWorks}</p>
            </Block>
          )}
          {p.sideEffects.length > 0 && (
            <Block title="Reported side effects">
              <ul className="flex flex-wrap gap-2">
                {p.sideEffects.map((s) => (
                  <li key={s} className="rounded-full bg-mist px-3 py-1.5 text-xs font-medium text-ink/80">
                    {s}
                  </li>
                ))}
              </ul>
            </Block>
          )}
          {p.faq.length > 0 && (
            <Block title="Frequently asked questions">
              <div className="space-y-2">
                {p.faq.map((f) => (
                  <details key={f.question} className="group rounded-2xl border border-line bg-white px-5 py-4">
                    <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden">
                      {f.question}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{f.answer}</p>
                  </details>
                ))}
              </div>
            </Block>
          )}
        </div>

        <aside className="space-y-4">
          {p.safety.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold">Safety information</h2>
              <div className="mt-4 space-y-3">
                {p.safety.map((n) => (
                  <SafetyCard key={n.key} note={n} />
                ))}
              </div>
            </div>
          )}
          {p.missedDose && (
            <div className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-sm font-semibold">Missed dose</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.missedDose}</p>
            </div>
          )}
          <div className="rounded-2xl bg-sage/70 p-5 text-xs leading-relaxed text-brand-dark">
            <p className="font-semibold">Procurement reference only</p>
            <p className="mt-1.5">
              Information is provided by the DrugSetu catalogue and is not medical advice.
              {!hasClinical && " Clinical details are not listed for this product."} Product availability and export
              feasibility depend on destination-country regulations and applicable licensing requirements.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
