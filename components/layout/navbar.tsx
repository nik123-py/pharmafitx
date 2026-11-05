"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipboardList, Menu, Search, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useCart, useHydrated } from "@/store/cart";
import { cn } from "@/lib/utils/cn";
import { buttonClass } from "@/components/ui/button";
import { Logo } from "./logo";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const hydrated = useHydrated();
  const count = useCart((s) => s.items.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const cartCount = hydrated ? count : 0;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md transition-[box-shadow,border-color] duration-300",
        scrolled ? "border-b border-line shadow-[0_6px_24px_-18px_rgb(37_43_39/0.25)]" : "border-b border-transparent",
      )}
    >
      <nav className="container-page flex h-[4.5rem] items-center justify-between gap-6" aria-label="Main">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {siteConfig.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[0.94rem] font-medium transition-colors",
                  isActive(pathname, item.href) ? "text-brand-dark" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
                {isActive(pathname, item.href) && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand"
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/products"
            aria-label="Search products"
            className="hidden size-11 place-items-center rounded-full text-ink transition-colors hover:bg-mist sm:grid"
          >
            <Search className="size-[1.2rem]" strokeWidth={1.8} />
          </Link>
          <Link
            href="/cart"
            aria-label={`Enquiry cart, ${cartCount} product${cartCount === 1 ? "" : "s"}`}
            className="relative grid size-11 place-items-center rounded-full bg-mist text-ink transition-colors hover:bg-sage"
          >
            <ClipboardList className="size-[1.2rem]" strokeWidth={1.8} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[0.68rem] font-semibold text-white ring-2 ring-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <Link href="/cart" className={buttonClass("primary", "sm", "ml-1 hidden md:inline-flex")}>
            Request a Quote
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full text-ink hover:bg-mist lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-white lg:hidden"
          >
            <ul className="container-page flex flex-col gap-1 py-4">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-medium",
                      isActive(pathname, item.href) ? "bg-sage text-brand-dark" : "text-ink hover:bg-mist",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className={buttonClass("primary", "lg", "w-full")}
                >
                  Enquiry Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
