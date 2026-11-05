import Link from "next/link";
import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "whatsapp";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-55 select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark shadow-[0_8px_20px_-10px_rgb(79_139_97/0.7)] active:scale-[0.98]",
  secondary: "bg-sage text-brand-dark hover:bg-sage-strong active:scale-[0.98]",
  outline: "border border-line bg-white text-ink hover:border-brand-light hover:text-brand-dark active:scale-[0.98]",
  ghost: "text-ink hover:bg-mist",
  whatsapp: "bg-[#25D366] text-[#0b3d1f] hover:bg-[#1fbe5b] active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ComponentProps<"button"> & CommonProps>(
  function Button({ variant = "primary", size = "md", className, children, type = "button", ...rest }, ref) {
    return (
      <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...rest}>
        {children}
      </button>
    );
  },
);

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & CommonProps) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
