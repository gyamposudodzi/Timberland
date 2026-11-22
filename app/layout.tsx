import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ConditionalChrome } from "@/components/layout/conditional-chrome";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Parcel — Courier & Freight Logistics",
    template: "%s · Parcel",
  },
  description:
    "Express parcels, reliable freight, and a simpler way to ship. Track any shipment as a guest, or create an account to manage deliveries.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ConditionalChrome header={<SiteHeader />} footer={<SiteFooter />}>
          {children}
        </ConditionalChrome>
      </body>
    </html>
  );
}
