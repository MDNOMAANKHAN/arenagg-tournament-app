
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "ARENAGG | Community Esports Platform",
  description:
    "Join ARENAGG tournaments for Free Fire MAX, BGMI, and Valorant.",
=======
  title: "ArenaGG | Gaming Tournaments",
  description:
    "Join ArenaGG gaming tournaments and compete in Free Fire MAX, BGMI and Valorant.",
>>>>>>> 9be109d (Update ARENAGG UI and registration functionality)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
<<<<<<< HEAD
      <body>{children}</body>
=======
      <body className="min-h-screen bg-[#050b18] text-white">
        {children}
      </body>
>>>>>>> 9be109d (Update ARENAGG UI and registration functionality)
    </html>
  );
}
