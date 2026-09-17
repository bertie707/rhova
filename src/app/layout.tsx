import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_DESCRIPTION =
  "Find gap year placements worldwide: rugby clubs, farms, ski seasons and more, each one verified by a real phone call, with real detail on housing, cost of living, and what the experience is actually like.";

export const metadata: Metadata = {
  title: "Rhova",
  description: SITE_DESCRIPTION,
  keywords: ["gap year", "gap year rugby", "gap year placements", "rugby club gap year", "work abroad gap year"],
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "Rhova",
    description: SITE_DESCRIPTION,
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1c8c7c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plexSans.variable} h-full antialiased`}
    >
      <body className="h-full">
        {children}
        <ServiceWorkerRegistration />
        <script
          type="application/ld+json"
          // Static, developer-authored JSON — safe to inject directly.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Rhova",
              description: SITE_DESCRIPTION,
              url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            }),
          }}
        />
      </body>
    </html>
  );
}
