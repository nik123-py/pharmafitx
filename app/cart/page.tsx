import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Enquiry Cart",
  description: "Review your selected medicines, quantities and requirements, then send a quotation request via WhatsApp.",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="container-page pb-4 pt-10 sm:pt-14">
      <p className="eyebrow">B2B quotation request</p>
      <h1 className="mt-3 text-4xl font-medium leading-tight sm:text-5xl">Enquiry cart</h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
        Build your procurement request, add product-specific requirements, and send it to our team on WhatsApp for a
        personalised quotation.
      </p>
      <div className="mt-10">
        <CartView />
      </div>
    </div>
  );
}
