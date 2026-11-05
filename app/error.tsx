"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <h1 className="text-3xl font-medium sm:text-4xl">Something went wrong</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Please try again. Your enquiry cart is saved on this device and has not been lost.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/cart" variant="outline">
            Open enquiry cart
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
