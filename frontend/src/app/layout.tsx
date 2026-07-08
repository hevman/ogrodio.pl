import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site-config";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host")?.split(":")[0] || "";
  const isShopHost = host === "sklep.ogrodio.localhost" || host === "sklep.ogrodio.pl";
  const isAppHost = host === "app.ogrodio.localhost" || host === "app.ogrodio.pl";
  const isPanelHost = host === "panel.ogrodio.localhost" || host === "panel.ogrodio.pl";
  const noIndex = isShopHost || isAppHost || isPanelHost;

  return {
    metadataBase: new URL(site.publicUrl),
    title: `${site.name} — platforma ogrodnicza`,
    description: site.description,
    applicationName: site.name,
    manifest: "/site.webmanifest",
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    icons: {
      icon: [
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
      shortcut: ["/favicon.png"],
    },
    openGraph: {
      description: site.tagline,
      locale: "pl_PL",
      title: site.name,
      type: "website",
      siteName: site.name,
      images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Ogrodio" }],
    },
    twitter: {
      card: "summary",
      title: site.name,
      description: site.tagline,
      images: ["/icon-512.png"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const host = (await headers()).get("host")?.split(":")[0] || "";
  const isShopHost = host === "sklep.ogrodio.localhost" || host === "sklep.ogrodio.pl";
  const isAppHost = host === "app.ogrodio.localhost" || host === "app.ogrodio.pl";
  const isPanelHost = host === "panel.ogrodio.localhost" || host === "panel.ogrodio.pl";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description: site.description,
    email: site.email,
    name: site.name,
    url: site.publicUrl,
  };

  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      lang="pl"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
      </head>
      <body className="flex min-h-full flex-col bg-[#eef1f6] text-slate-900">
        {isPanelHost ? null : <SiteHeader initialIsShopHost={isShopHost} />}
        <main className="flex-1">{children}</main>
        {isAppHost || isPanelHost ? null : <SiteFooter variant={isShopHost ? "shop" : "site"} />}
      </body>
    </html>
  );
}
