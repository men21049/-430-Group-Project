import React from "react";
import Header from "@/app/ui/landing-page/header";
import CallToAction from "@/app/ui/landing-page/cta-section";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4">{children}</main>

      <CallToAction />
    </div>
  );
}
