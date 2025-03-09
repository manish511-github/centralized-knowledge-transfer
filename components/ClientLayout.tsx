"use client"; // This makes it a client component

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Get the current route
  const hideFooterRoutes = ["/assistant"]; // List of routes where the footer should be hidden

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">{children}</div>
      {!hideFooterRoutes.includes(pathname) && <Footer />}
    </div>
  );
}