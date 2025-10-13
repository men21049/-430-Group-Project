"use client";

import { useState, useEffect } from "react";

export default function PayButton({
  orderId,
  status,
  after,
}: {
  orderId: string;
  status: string; // ✅ required
  after?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(status === "PAID");

  useEffect(() => {
    setPaid(status === "PAID");
  }, [status]);

  const handlePay = async () => {
    if (!confirm("Proceed with payment for this order?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok && data?.ok) {
        setPaid(true);
        alert("Payment successful. Order marked as PAID.");
        after?.();
      } else {
        alert("Payment failed: " + (data?.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error while processing payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading || paid}
      className={`px-4 py-2 rounded text-white ${
        paid ? "bg-green-600" : "bg-indigo-600 hover:bg-indigo-700"
      } disabled:opacity-60`}
    >
      {loading ? "Processing..." : paid ? "Paid" : "Pay"}
    </button>
  );
}
