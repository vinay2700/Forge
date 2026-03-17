import type { Metadata } from "next";
import { Syne, DM_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FORGE - Career Intelligence Platform",
  description: "Career intelligence for the AI era",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${dmMono.variable} ${instrumentSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
