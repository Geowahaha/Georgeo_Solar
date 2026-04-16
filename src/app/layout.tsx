import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "GeorGeo Duck4 Solar | No.1 Premium Solar Roof",
    template: "%s | GeorGeo Duck4 Solar",
  },
  description:
    "GeorGeo Duck4 Solar — No.1 premium solar roof in Thailand. Professional team, premium quality, proactive service. Request a quote and save on energy.",
  openGraph: {
    title: "GeorGeo Duck4 Solar | No.1 Premium Solar Roof",
    description:
      "We stand by you — professional team, premium quality, and proactive service.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black font-sans text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
