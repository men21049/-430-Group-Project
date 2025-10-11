"use client";

import WithAuth from "@/app/components/withAuth";
import OrdersContent from "@/app/shop/Orders"; 
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

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
    <WithAuth role="SELLER">
      <OrdersContent />
    </WithAuth>
  );
}
