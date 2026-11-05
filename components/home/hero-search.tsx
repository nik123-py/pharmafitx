"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
      }}
      className="mt-10 flex max-w-xl items-center gap-2 rounded-full border border-line bg-white p-1.5 pl-5 shadow-soft focus-within:border-brand-light focus-within:shadow-[0_0_0_4px_rgb(139_190_145/0.2)]"
    >
      <Search className="size-4 shrink-0 text-muted" />
      <label htmlFor="hero-search" className="sr-only">
        Search medicines
      </label>
      <input
        id="hero-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        maxLength={100}
        placeholder="Search by medicine, generic name or manufacturer"
        className="min-w-0 flex-1 bg-transparent py-2 text-[0.95rem] outline-none placeholder:text-muted/70"
      />
      <button
        type="submit"
        className="h-10 shrink-0 rounded-full bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
      >
        Search
      </button>
    </form>
  );
}
