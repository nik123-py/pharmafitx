"use client";

import { useState } from "react";
import { Droplets, FlaskConical, Package, Pill, Syringe, Tablets } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function FormIcon({ form, name, className }: { form?: string; name?: string; className?: string }) {
  const s = `${form ?? ""} ${name ?? ""}`.toLowerCase();
  const props = { className, strokeWidth: 1.5 };
  if (/inject|infusion|vial|ampoule/.test(s)) return <Syringe {...props} />;
  if (/syrup|suspension|solution|liquid|drop|wash/.test(s)) return <Droplets {...props} />;
  if (/cream|gel|ointment|lotion|moisturi/.test(s)) return <FlaskConical {...props} />;
  if (/capsule|vegicap|softgel/.test(s)) return <Pill {...props} />;
  if (/tablet|strip/.test(s)) return <Tablets {...props} />;
  return <Package {...props} />;
}

/**
 * Shows the DrugSetu product image when one exists; otherwise a neutral
 * dosage-form illustration (clearly not a product photo).
 */
export function ProductVisual({
  image,
  name,
  dosageForm,
  className,
  size = "md",
}: {
  image?: string;
  name: string;
  dosageForm?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const showImage = image && !failed;

  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden bg-mist",
        size === "sm" ? "rounded-xl" : "rounded-2xl",
        className,
      )}
    >
      {showImage ? (
        <img
          src={image}
          alt={name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-[8%] mix-blend-multiply"
        />
      ) : (
        <>
          <div aria-hidden className="absolute inset-[18%] rounded-full bg-sage/80 blur-[2px]" />
          <div
            aria-hidden
            className={cn(
              "relative grid place-items-center rounded-[30%] bg-white text-brand shadow-soft",
              size === "sm" ? "size-9" : size === "lg" ? "size-24" : "size-16",
            )}
          >
            <FormIcon form={dosageForm} name={name} className={size === "sm" ? "size-4" : size === "lg" ? "size-10" : "size-7"} />
          </div>
          {size !== "sm" && (
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted/80">
              Image not available
            </span>
          )}
        </>
      )}
    </div>
  );
}
