import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalGuide — Discover places around you",
  description:
    "LocalGuide helps you find the best attractions, restaurants, and hidden gems near your location.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
