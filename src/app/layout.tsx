import type { Metadata } from "next";
import { Anton, Bebas_Neue, Inter } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { STORE } from "@/lib/store";
import { siteUrlObject } from "@/lib/site";
import "./globals.css";

/* Anton stays, but only for the logo lockup — it is the closest web face to the
   heavy condensed gothic painted on the awning, so the wordmark keeps reading as
   the shop's own sign. Everything else moves to the Fontshare trio below. */
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: siteUrlObject(),
  title: {
    default: "Mr Smoke Et Slice — Burgers halal & pizza grillés au feu | NDG Montréal",
    template: "%s | Mr Smoke Et Slice",
  },
  description:
    "Burgers halal smashés, pizza à croûte fine et poulet grillé au feu sur Sherbrooke Ouest à NDG. Commandez en ligne — livraison et ramassage.",
  keywords: ["halal Montreal", "pizza NDG", "burger halal", "shish taouk Montréal", "livraison NDG"],
  openGraph: {
    type: "website",
    locale: "fr_CA",
    alternateLocale: "en_CA",
    siteName: STORE.name,
    title: "Mr Smoke Et Slice — Grillé au feu, servi brûlant",
    description: "Burgers halal, pizza à croûte fine et grillades au feu. NDG, Montréal.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: STORE.name,
    servesCuisine: ["Halal", "Pizza", "Burgers", "Middle Eastern"],
    priceRange: "$10-20",
    telephone: STORE.phoneDisplay,
    address: {
      "@type": "PostalAddress",
      streetAddress: "5518 Sherbrooke St W",
      addressLocality: "Montréal",
      addressRegion: "QC",
      postalCode: "H4A 1W2",
      addressCountry: "CA",
    },
    geo: { "@type": "GeoCoordinates", latitude: STORE.lat, longitude: STORE.lng },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: STORE.googleRating,
      reviewCount: STORE.googleReviews,
    },
    acceptsReservations: false,
    hasDeliveryMethod: ["https://schema.org/OnSitePickup", "https://schema.org/ParcelService"],
  };

  return (
    <html lang="fr-CA" className={`${anton.variable} ${bebas.variable} ${inter.variable}`}>
      <head>
        {/* Three voices, one rule:
            Cabinet Grotesk is the restaurant speaking (headlines, section titles),
            Erode is the food and the guests speaking (dish names, review pull-quotes),
            Satoshi is plain conversation (body, UI, prices).
            Never mixed inside a single line. */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,900,700&f[]=satoshi@400,500,700,900&f[]=erode@400,500,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <MotionProvider />
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
