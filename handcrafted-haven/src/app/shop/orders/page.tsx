"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import WithAuth from "@/app/components/withAuth";
import OrdersContent from "@/app/shop/Orders";
import Header from "@/app/ui/landing-page/header";
import CallToAction from "@/app/ui/landing-page/cta-section";
import Footer from "@/app/ui/footer";

export default function OrdersPage() {
  const router = useRouter();

  useEffect(() => {
    // Detect authentication via cookies directly for header navigation
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (!token || !role) {
      router.push("/login");
    }
  }, [router]);

  return (
    <>
      <Header />
      <WithAuth role="SELLER">
        <main className="min-h-screen">
          <OrdersContent />
          <CallToAction />
        </main>
      </WithAuth>
      <Footer />
    </>
  );
}
