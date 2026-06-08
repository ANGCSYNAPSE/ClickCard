import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://clickcard.app"),
  title: {
    default: "ClickCard — One link for your whole identity",
    template: "%s · ClickCard",
  },
  description:
    "ClickCard turns your identity into one beautiful, shareable link. Build a digital profile, branded business card, resume and QR — share anywhere in seconds.",
  keywords: [
    "digital business card",
    "link in bio",
    "QR code",
    "digital identity",
    "resume builder",
    "ClickCard",
  ],
  openGraph: {
    title: "ClickCard — One link for your whole identity",
    description:
      "Build a digital profile, branded card, resume & QR. Share your whole identity with one link.",
    type: "website",
    siteName: "ClickCard",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} ${sora.variable} font-sans bg-white text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
