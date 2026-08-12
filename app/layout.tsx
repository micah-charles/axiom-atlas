import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const socialImage = `${protocol}://${host}/og.png`;
  const description = "Think with your hands across 15 mathematical worlds, 600 generated campaign missions, and infinite expeditions.";
  return {
    title: { default: "The Axiom Atlas", template: "%s · The Axiom Atlas" },
    description,
    applicationName: "The Axiom Atlas",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Axiom Atlas" },
    openGraph: { title: "The Axiom Atlas", description, type: "website", images: [{ url: socialImage, width: 1200, height: 630, alt: "The 15 mathematical worlds of The Axiom Atlas" }] },
    twitter: { card: "summary_large_image", title: "The Axiom Atlas", description, images: [socialImage] },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover", themeColor: "#070813" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
