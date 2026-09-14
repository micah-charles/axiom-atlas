import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const socialImage = `${protocol}://${host}/og.png`;
  return {
    title: { default: "Axiom Atlas — Explore. Discover. Understand.", template: "%s · Axiom Atlas" },
    description: "An interactive learning universe where ideas become places to explore.",
    applicationName: "The Axiom Atlas",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Axiom Atlas" },
    openGraph: { title: "Axiom Atlas — Explore. Discover. Understand.", description: "An interactive learning universe where ideas become places to explore.", type: "website", images: [{ url: socialImage, width: 1200, height: 630, alt: "Axiom Atlas learning realms" }] },
    twitter: { card: "summary_large_image", title: "Axiom Atlas — Explore. Discover. Understand.", description: "An interactive learning universe where ideas become places to explore.", images: [socialImage] },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover", themeColor: "#070813" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
