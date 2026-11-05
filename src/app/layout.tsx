
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARENAGG | Community Esports Platform",
  description:
    "Join ARENAGG tournaments for Free Fire MAX, BGMI, and Valorant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#050b18] text-white">
        {children}
      </body>
    </html>
  );
}
