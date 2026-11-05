"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ProductVisual } from "./product-visual";

export function Gallery({ images, name, dosageForm }: { images: string[]; name: string; dosageForm?: string }) {
  const [active, setActive] = useState(0);
  const list = images.slice(0, 8);
  return (
    <div>
      <ProductVisual
        key={list[active] ?? "none"}
        image={list[active]}
        name={name}
        dosageForm={dosageForm}
        size="lg"
        className="aspect-square w-full rounded-[2rem]"
      />
      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {list.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={i === active}
              className={cn(
                "aspect-square overflow-hidden rounded-xl border-2 bg-mist transition-colors",
                i === active ? "border-brand" : "border-transparent hover:border-sage-strong",
              )}
            >
              <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-contain p-1 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
