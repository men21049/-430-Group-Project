// src/app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WithAuth from "@/app/components/withAuth";

interface CheckoutPageProps {
  role?: "CUSTOMER" | "SELLER";
}

function CheckoutPageContent({ role }: CheckoutPageProps) {
  const [status, setStatus] = useState("Processing checkout...");
  const router = useRouter();

  useEffect(() => {
    const handleCheckout = async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (res.ok) {
          const { orderId } = await res.json();
          router.push(`/orders/${orderId}`);
        } else {
          setStatus("Checkout failed. Please try again.");
        }
      } catch (err) {
        console.error(err);
        setStatus("An error occurred during checkout.");
      }
    };

    handleCheckout();
  }, [router]);

  return (
    <main className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center text-lg font-medium text-gray-700">{status}</div>
    </main>
  );
}

export default function ProtectedCheckoutPage({ role }: CheckoutPageProps) {
  return (
    <WithAuth>
      <CheckoutPageContent role={role} />
    </WithAuth>
  );
}
