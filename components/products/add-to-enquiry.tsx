"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import type { MedicineSummary } from "@/types/medicine";
import { useCart, useHydrated } from "@/store/cart";
import type { QuantityUnit } from "@/lib/validations/enquiry";
import { MAX_ITEMS } from "@/lib/validations/enquiry";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function notifyAdd(result: "added" | "updated" | "full", name: string, goToCart?: () => void) {
  if (result === "full") {
    toast.error("Enquiry cart is full", { description: `An enquiry can include up to ${MAX_ITEMS} products.` });
    return;
  }
  toast.success(result === "added" ? "Added to enquiry" : "Quantity updated", {
    description: name,
    action: goToCart ? { label: "View cart", onClick: goToCart } : undefined,
  });
}

export function AddToEnquiryButton({
  product,
  quantity,
  unit,
  size = "sm",
  className,
  label = "Add to Enquiry",
}: {
  product: MedicineSummary;
  quantity?: number;
  unit?: QuantityUnit;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.items.some((i) => i.id === product.id));
  const hydrated = useHydrated();
  const [pulse, setPulse] = useState(false);

  const onClick = () => {
    const result = add(product, quantity, unit);
    notifyAdd(result, product.name, () => router.push("/cart"));
    if (result !== "full") {
      setPulse(true);
      setTimeout(() => setPulse(false), 900);
    }
  };

  const added = hydrated && inCart;

  return (
    <Button
      onClick={onClick}
      size={size}
      variant={added ? "secondary" : "primary"}
      className={cn(pulse && "scale-[0.97]", className)}
      aria-label={`${label}: ${product.name}`}
    >
      {added ? <Check className="size-4" /> : <Plus className="size-4" />}
      {added && !quantity ? "Add more" : label}
    </Button>
  );
}

export function InCartHint({ id }: { id: string }) {
  const hydrated = useHydrated();
  const item = useCart((s) => s.items.find((i) => i.id === id));
  if (!hydrated || !item) return null;
  return (
    <p className="text-xs text-muted">
      In your enquiry: {item.quantity.toLocaleString("en-US")} {item.unit.toLowerCase()} ·{" "}
      <Link href="/cart" className="font-medium text-brand hover:text-brand-dark">
        Review cart
      </Link>
    </p>
  );
}
