import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "GatheringRef — Image Reference Gallery",
    template: "%s | GatheringRef",
  },
  description:
    "Collect, organize, and share your image references. Create galleries to curate your visual inspiration — keep them private or share with the world.",
  keywords: [
    "image gallery",
    "reference images",
    "mood board",
    "visual inspiration",
    "image collection",
    "design references",
  ],
  authors: [{ name: "GatheringRef" }],
  openGraph: {
    title: "GatheringRef — Image Reference Gallery",
    description:
      "Collect, organize, and share your image references. Create galleries to curate your visual inspiration.",
    type: "website",
    locale: "en_US",
    siteName: "GatheringRef",
  },
  twitter: {
    card: "summary_large_image",
    title: "GatheringRef — Image Reference Gallery",
    description:
      "Collect, organize, and share your image references. Create galleries to curate your visual inspiration.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-bg font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
