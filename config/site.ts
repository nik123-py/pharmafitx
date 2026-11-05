/**
 * Public, non-secret site configuration. Safe to import from client components.
 */
export const siteConfig = {
  name: "Pharmafitx",
  tagline: "Global pharmaceutical supply",
  description:
    "Pharmafitx connects healthcare businesses worldwide with reliable pharmaceutical sourcing, bulk procurement and streamlined international supply enquiries.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  nav: [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
