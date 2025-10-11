// src/app/ui/CartDrawer.tsx
"use client";

import React, { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

type Props = { open?: boolean; onClose?: () => void };

export default function CartDrawer({ open = false, onClose }: Props) {
  const { items, totalPrice, increment, decrement, removeItem, clearCart, checkout, isAuthenticated } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!open) return null;

  const handleCheckout = async () => {
    if (isAuthenticated === null) return alert("Checking authentication – try again in a moment.");
    if (!isAuthenticated) return router.push("/login");
    if (items.length === 0) return alert("Your cart is empty.");

    setLoading(true);
    try {
      const res = await checkout();
      if (res.ok) {
        alert("✅ Order placed successfully! ID: " + res.orderId);
        onClose?.();
        if (res.orderId) router.push(`/shop/orders/${res.orderId}`);
      } else {
        alert("❌ Checkout failed: " + (res.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Checkout exception:", err);
      alert("❌ Checkout failed: " + (err?.message ?? "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (items.length === 0) return alert("Cart is already empty.");
    if (!confirm("Clear entire cart?")) return;
    await clearCart();
    alert("Cart cleared.");
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal>
      <div className="fixed inset-0 bg-black/30" onClick={() => onClose?.()} />

      <aside className="relative bg-white w-96 max-w-full h-full p-4 overflow-y-auto">
        <button onClick={() => onClose?.()} className="absolute right-3 top-3 text-gray-600" aria-label="Close">
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Your Cart</h2>

        {items.length === 0 ? (
          <p className="text-sm text-gray-600">Your cart is empty.</p>
        ) : (
          <>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-3 border rounded p-2">
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">Price: ${item.price.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-700 font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => decrement(item.id)} className="px-2 py-1 border rounded">
                        −
                      </button>
                      <div className="px-3" aria-live="polite">{item.quantity}</div>
                      <button onClick={() => increment(item.id)} className="px-2 py-1 border rounded">
                        +
                      </button>
                      <button
                        onClick={() => { if (!confirm(`Remove ${item.name}?`)) return; removeItem(item.id); }}
                        className="ml-auto text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-lg font-bold">${totalPrice?.toFixed(2) ?? "0.00"}</div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
                >
                  {loading ? "Processing..." : "Checkout"}
                </button>

                <button
                  onClick={handleClear}
                  className="w-full px-4 py-2 border rounded bg-white text-sm hover:bg-gray-50"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
