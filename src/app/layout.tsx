// app/layout.tsx
import React from "react";
import "./globals.css"; // Import global styles (if any)
import { Metadata } from "next"; // If you're using metadata

// Define metadata for the page (optional)
export const metadata: Metadata = {
  title: "E-Commerce",
  description: "A simple solution for all your needs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
