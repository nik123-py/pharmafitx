import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Pharmafitx — Global B2B Pharmaceutical Supply",
    template: "%s · Pharmafitx",
  },
  description: siteConfig.description,
  openGraph: {
    title: "Pharmafitx — Healthcare Supply, Without Boundaries",
    description: siteConfig.description,
    type: "website",
    siteName: "Pharmafitx",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-dvh overflow-x-hidden">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <Toaster
          position="bottom-center"
          toastOptions={{
            classNames: {
              toast: "!rounded-2xl !border !border-line !shadow-lift !font-sans",
              title: "!text-ink !font-medium",
              description: "!text-muted",
            },
          }}
        />
      </body>
    </html>
  );
}
