import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn("size-9", className)}>
      <rect width="40" height="40" rx="12" fill="#4F8B61" />
      <path
        d="M20 9.5c-5.5 3.2-8.5 7.6-8.5 12.2 0 4.9 3.8 8.8 8.5 8.8s8.5-3.9 8.5-8.8c0-4.6-3-9-8.5-12.2Z"
        fill="#E6F1E6"
      />
      <path d="M20 15.5v11M14.5 21h11" stroke="#4F8B61" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Pharmafitx home">
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6" />
      <span
        className={cn(
          "font-display text-[1.3rem] font-semibold tracking-tight",
          tone === "dark" ? "text-ink" : "text-white",
        )}
      >
        Pharma<span className="text-brand">fitx</span>
      </span>
    </Link>
  );
}
