import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
