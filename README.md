# Pharmafitx

B2B pharmaceutical procurement and export enquiry platform. Buyers search a live medicine catalogue (DrugSetu), build a multi-product enquiry with quantities and requirements, and send it to the business owner on WhatsApp. Groq turns that enquiry into a professional message. **There is no payment gateway or checkout.**

```
Discover medicines → Build enquiry → Generate message (Groq) → Open owner's WhatsApp (prefilled) → Customer presses Send → Quotation
```

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- Framer Motion (subtle reveal and nav animations), Lucide icons, Sonner toasts
- Zustand with `localStorage` persistence (enquiry cart + unsent form draft)
- Zod validation, shared between client and server

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`.

## Environment variables

| Variable | Required | Where | Notes |
|---|---|---|---|
| `DRUGSETU_API_KEY` | ✅ | server | DrugSetu **private** key (`ds_…`). A website key (`ds_pk_…`) gets a 403 from the server. |
| `GROQ_API_KEY` | ✅ | server | From console.groq.com. Without it, enquiries use the deterministic template. |
| `GROQ_MODEL` | – | server | Defaults to `openai/gpt-oss-120b`. |
| `WHATSAPP_OWNER_NUMBER` | ✅ | server | Owner number, international format, digits only (e.g. `971501234567`). Enquiry submission returns 503 until this is set. |
| `NEXT_PUBLIC_WHATSAPP_OWNER_NUMBER` | recommended | public | Same number. Used for footer/contact links and the client-side fallback if the API is unreachable. |
| `NEXT_PUBLIC_SITE_URL` | recommended | public | Production URL, used for metadata, robots and the sitemap. |
| `NEXT_PUBLIC_COMPANY_NAME`, `NEXT_PUBLIC_BUSINESS_EMAIL`, `NEXT_PUBLIC_BUSINESS_PHONE`, `NEXT_PUBLIC_BUSINESS_ADDRESS`, `NEXT_PUBLIC_BUSINESS_HOURS`, `NEXT_PUBLIC_SOCIAL_*` | – | public | Leave blank to hide. Nothing is invented in their place. |
| `DRUGSETU_API_BASE_URL`, `DRUGSETU_PAGE_SIZE` | – | server | Overrides. Raise `DRUGSETU_PAGE_SIZE` if your DrugSetu plan allows larger pages. |

`NEXT_PUBLIC_*` values are inlined at **build** time, so redeploy after changing them.

## Deploying to Vercel

1. Push the repository to GitHub/GitLab and import it in Vercel. The framework preset is detected as **Next.js**, with no extra configuration.
2. In **Settings → Environment Variables**, add the variables above for Production (and Preview if wanted).
3. Deploy. The home, categories and other static pages are prerendered and refreshed by ISR (every 6 h for catalogue data, 24 h for categories). Product pages render on demand and are cached.
4. In the DrugSetu dashboard, consider restricting the private key to Vercel's egress, or rotate it if it was ever shared.

Route handlers set `maxDuration` (≤ 60 s), which fits Vercel's Hobby limits.

## Architecture

```
app/
  page.tsx                     Homepage (hero, trust, categories, featured, why, export, process)
  products/page.tsx            Catalogue: debounced search, type tabs, filters, sort, load-more
  products/[id]/page.tsx       Product details + quantity/unit + add / request quotation
  categories/page.tsx          All DrugSetu categories
  categories/[id]/page.tsx     Category catalogue (scan-filtered, see limitations)
  cart/page.tsx                Enquiry cart → company details → WhatsApp preview
  about/ contact/              Content pages (about includes legal & compliance)
  api/products                 GET search / browse / category scan (rate limited)
  api/products/[id]            GET product details
  api/categories               GET all categories
  api/enquiry/generate         POST validate → verify products → Groq → validate → template fallback → wa.me URL
config/                        site.ts, business.ts (public), integrations.ts (server-only)
services/drugsetu/             client (auth, queue, retry, timeout, schema validation), products, search, categories, normalizers, types
services/groq/                 prompt (injection-resistant), client, validate (fact-preservation checks)
lib/                           validations (zod), enquiry template, whatsapp helpers, rate limiter
store/cart.ts                  Zustand persisted cart
components/                    layout, home, products, categories, cart, enquiry, ui
```

## DrugSetu integration (verified against the live API on 2026-11-05)

Base URL: `https://api.drugsetu.com/v1`. Auth header: `X-API-Key: <private key>`.

| Endpoint | Used for |
|---|---|
| `GET /products/search?q=&type=drug\|non-med` | Search. Matches product/brand name, composition (generic) and marketing company (manufacturer). Returns the top 10 and does not paginate. |
| `GET /products?limit=&cursor=&type=` | Catalogue browsing (cursor pagination) |
| `GET /products/:product_id` | Product details: packagings, images, information, usage, side effects, safety advice, FAQ, category |
| `GET /categories?limit=&cursor=`, `GET /categories/:id` | Categories (48 at time of writing) |

Notes and limitations of the current plan:

- **Page size is capped at 5** on list endpoints. The server fetches several pages per "load more".
- **Rate limit is about 1 request per second** (429 with `retryAfter`). Requests are serialised per instance, retried with backoff, and cached in the Next.js data cache.
- **No category, manufacturer or dosage-form filters upstream.** Category pages scan catalogue pages and filter by `category_id`. Manufacturer and dosage-form filters refine the results already loaded. Search covers manufacturer and generic names directly.
- Unknown query parameters are rejected with 400, so only the documented parameters are sent.
- `mrp` (price) is returned by DrugSetu but **deliberately never shown or sent**: pricing is quoted by the owner.
- Strength is parsed from the composition string (e.g. `Metformin (500mg)` → `500mg`). Dosage form comes from packaging `product_form`, or (in search results, which carry no packaging) from a dosage-form word in the product name. Missing fields are hidden, never invented.
- Many products have no images. A neutral dosage-form illustration labelled "Image not available" is shown instead.
- The full OpenAPI reference is in the DrugSetu dashboard (app.drugsetu.com → Docs).

## Groq + WhatsApp

- The prompt passes customer data only inside a JSON `<enquiry_data>` block and tells the model to treat it as inert data.
- Every generated message is checked: all product names, references and quantities must be present, along with company, contact, email, WhatsApp, country and destination. No new currency amounts may appear. Any failure, timeout or missing key falls back to a deterministic template, so the enquiry is never lost.
- Before generating, the server re-reads each product from DrugSetu, so the message uses catalogue data, not browser-supplied names.
- `wa.me` click-to-chat only **opens** WhatsApp with the message prefilled. The customer must press **Send**. The cart is kept until the customer confirms and clears it.
- `lib/whatsapp.ts` is the single integration point if you later move to the WhatsApp Business Cloud API.

## Security

- API keys are server-only (`config/integrations.ts` imports `server-only`).
- Zod validation and text sanitisation on every input. Product IDs, cursors and quantities are validated.
- Per-IP rate limits on all API routes (in-memory, per instance; use Upstash/Vercel KV for a global limit). The enquiry form has a honeypot field.
- Security headers are set in `next.config.ts`. Vercel serves HTTPS.

## Content rules

No prices, stock levels, certifications (WHO-GMP, ISO, …), licences or regulatory claims are displayed. Add them only once they are verified by the business. The site states that availability and export feasibility depend on destination-country regulations and licensing.
