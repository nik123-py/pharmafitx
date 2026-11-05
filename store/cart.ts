"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { MedicineSummary } from "@/types/medicine";
import { MAX_ITEMS, MAX_QUANTITY, type CustomerInput, type QuantityUnit } from "@/lib/validations/enquiry";

export interface CartItem {
  id: string;
  name: string;
  composition?: string;
  strength?: string;
  dosageForm?: string;
  manufacturer?: string;
  packaging?: string;
  image?: string;
  quantity: number;
  unit: QuantityUnit;
  notes: string;
  addedAt: number;
}

interface CartState {
  items: CartItem[];
  message: string;
  /** Unsent enquiry-form draft, kept so a refresh never loses what the buyer typed. */
  customer: Partial<CustomerInput>;
  setCustomer: (c: Partial<CustomerInput>) => void;
  add: (p: MedicineSummary, quantity?: number, unit?: QuantityUnit) => "added" | "updated" | "full";
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  setUnit: (id: string, unit: QuantityUnit) => void;
  setNotes: (id: string, notes: string) => void;
  setMessage: (message: string) => void;
  clear: () => void;
}

const clampQty = (n: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.round(Number.isFinite(n) ? n : 1)));

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      message: "",
      customer: {},
      setCustomer: (customer) => set({ customer }),
      add: (p, quantity = 100, unit = "Units") => {
        const existing = get().items.find((i) => i.id === p.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === p.id ? { ...i, quantity: clampQty(i.quantity + quantity) } : i,
            ),
          });
          return "updated";
        }
        if (get().items.length >= MAX_ITEMS) return "full";
        set({
          items: [
            ...get().items,
            {
              id: p.id,
              name: p.name,
              composition: p.composition,
              strength: p.strength,
              dosageForm: p.dosageForm,
              manufacturer: p.manufacturer,
              packaging: p.packaging,
              image: p.image,
              quantity: clampQty(quantity),
              unit,
              notes: "",
              addedAt: Date.now(),
            },
          ],
        });
        return "added";
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      setQuantity: (id, quantity) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity: clampQty(quantity) } : i)) }),
      setUnit: (id, unit) => set({ items: get().items.map((i) => (i.id === id ? { ...i, unit } : i)) }),
      setNotes: (id, notes) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, notes: notes.slice(0, 400) } : i)) }),
      setMessage: (message) => set({ message: message.slice(0, 1500) }),
      clear: () => set({ items: [], message: "" }),
    }),
    {
      name: "pharmafitx-enquiry-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, message: s.message, customer: s.customer }),
    },
  ),
);

/** Avoids hydration mismatches: persisted state is only rendered after mount. */
const noopSubscribe = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
