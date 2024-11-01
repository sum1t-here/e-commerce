// app/layout.tsx
import React from "react";
import "./globals.css"; // Import global styles (if any)
import { Metadata } from "next"; // If you're using metadata

// Define metadata for the page (optional)
export const metadata: Metadata = {
  title: "Your Site Title",
  description: "Your site description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {" "}
      {/* Specify the language for accessibility and SEO */}
      <body>
        {children} {/* Render the child components */}
      </body>
    </html>
  );
}
