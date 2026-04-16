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
    default: "Georgeo_Solar | Duck4 Solar CRM",
    template: "%s | Georgeo_Solar",
  },
  description:
    "Duck4 Solar — premium solar installation in Thailand. Request a quote, track your project, and save on energy.",
  openGraph: {
    title: "Georgeo_Solar | Duck4 Solar",
    description: "Solar CRM and quotes for homes and factories.",
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
      <body className="min-h-full bg-slate-950 font-sans text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
