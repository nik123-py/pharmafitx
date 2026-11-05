import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="eyebrow justify-center">404</p>
        <h1 className="mt-3 text-4xl font-medium sm:text-5xl">We couldn&apos;t find that page</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          The product or page may have moved, or the link may be incorrect.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/products">Browse products</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
