import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { businessConfig } from "@/config/business";
import { siteConfig } from "@/config/site";
import { buildWhatsAppUrl, formatPhoneForDisplay } from "@/lib/whatsapp";
import { getAllCategories } from "@/services/drugsetu";
import { displayCategoryName } from "@/services/drugsetu/normalizers";
import type { Category } from "@/types/medicine";
import { Logo } from "./logo";
import { FacebookIcon, InstagramIcon, LinkedInIcon, WhatsAppIcon, XIcon } from "./social-icons";

async function footerCategories(): Promise<Category[]> {
  try {
    return (await getAllCategories()).slice(0, 6);
  } catch {
    return [];
  }
}

export async function Footer() {
  const categories = await footerCategories();
  const wa = buildWhatsAppUrl(
    businessConfig.whatsappNumber,
    `Hello ${businessConfig.companyName} Team, I'd like to discuss a pharmaceutical procurement requirement.`,
  );
  const socials = [
    { href: businessConfig.social.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { href: businessConfig.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: businessConfig.social.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: businessConfig.social.x, label: "X", Icon: XIcon },
  ].filter((s) => s.href);

  return (
    <footer className="mt-24 border-t border-line bg-mist">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-muted">
            B2B pharmaceutical sourcing and procurement enquiries for distributors, wholesalers, importers, pharmacies
            and hospitals. Pricing, availability and export terms are confirmed directly with our team.
          </p>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-soft transition-colors hover:text-brand-dark"
            >
              <WhatsAppIcon className="size-4 text-[#25D366]" />
              Enquire on WhatsApp
            </a>
          )}
          {socials.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-line bg-white text-muted transition-colors hover:border-brand-light hover:text-brand"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold">Explore</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {siteConfig.nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-brand-dark">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/cart" className="hover:text-brand-dark">
                Enquiry Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Categories</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/categories/${c.id}`} className="hover:text-brand-dark">
                  {displayCategoryName(c.name)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/categories" className="font-medium text-brand hover:text-brand-dark">
                All categories →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Contact</h3>
          <ul className="mt-4 space-y-3.5 text-sm text-muted">
            {businessConfig.whatsappNumber && (
              <li className="flex items-start gap-2.5">
                <WhatsAppIcon className="mt-0.5 size-4 shrink-0 text-brand" />
                <a href={wa ?? "#"} target="_blank" rel="noopener noreferrer" className="hover:text-brand-dark">
                  {formatPhoneForDisplay(businessConfig.whatsappNumber)}
                </a>
              </li>
            )}
            {businessConfig.email && (
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.8} />
                <a href={`mailto:${businessConfig.email}`} className="break-all hover:text-brand-dark">
                  {businessConfig.email}
                </a>
              </li>
            )}
            {businessConfig.phone && (
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.8} />
                <a href={`tel:${businessConfig.phone.replace(/[^\d+]/g, "")}`} className="hover:text-brand-dark">
                  {businessConfig.phone}
                </a>
              </li>
            )}
            {businessConfig.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.8} />
                <span className="whitespace-pre-line">{businessConfig.address}</span>
              </li>
            )}
            <li>
              <Link href="/contact" className="font-medium text-brand hover:text-brand-dark">
                Contact page →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-6 text-xs leading-relaxed text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {businessConfig.companyName}. All rights reserved.
          </p>
          <p className="max-w-3xl md:text-right">
            Product information is sourced from the DrugSetu catalogue and is provided for procurement reference only —
            it is not medical advice. Availability and export feasibility depend on destination-country regulations and
            applicable licensing. <Link href="/about#compliance" className="underline underline-offset-2 hover:text-ink">Legal &amp; compliance</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
