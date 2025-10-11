// handcrafted-haven/src/app/shop/orders/PayButton.tsx
"use client";

import { useState } from "react";

export default function PayButton({ orderId, after }: { orderId: string; after?: () => void }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!confirm("Mark this order as PAID?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok && data?.ok) {
        alert("Order marked as PAID.");
        after?.();
      } else {
        alert("Failed: " + (data?.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error while marking paid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
    >
      {loading ? "Processing..." : "Mark as Paid"}
    </button>
  );
}
