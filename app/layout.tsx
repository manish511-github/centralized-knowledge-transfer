import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";
import ClientLayout from "@/components/ClientLayout"; // Import the new component

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Company Knowledge Hub",
  description: "A centralized knowledge sharing platform for employees",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ClientLayout>{children}</ClientLayout> {/* Use ClientLayout here */}
        </Providers>
      </body>
    </html>
  );
}
