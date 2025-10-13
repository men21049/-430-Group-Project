// handcrafted-haven\src\app\shop\cart\CartContent.tsx
"use client";

import React, { useEffect } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

export default function CartContent() {
  const { items, loadCart, increment, decrement, removeItem, clearCart, totalPrice, isAuthenticated } =
    useCart();
  const router = useRouter();

  useEffect(() => {
    loadCart().catch(console.error);
  }, [loadCart]);

  if (isAuthenticated === null) return <div className="p-6 text-center">Checking authentication...</div>;

  // NOTE: we intentionally allow guests to view and manage the cart.
  // Redirect to login only when they try to checkout.

  if (!items || items.length === 0)
    return <div className="p-6 text-center">Your cart is empty.</div>;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      <ul className="divide-y divide-gray-200 mb-4">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-4">
            <img
              src={item.image ?? "/artisans/fallback.jpg"}
              alt={item.name}
              className="w-16 h-16 rounded object-cover"
            />
            <div className="flex-1">
              <h2 className="font-semibold">{item.name}</h2>
              <p className="text-gray-500">
                {item.quantity} × ${item.price.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="font-semibold">${(item.quantity * item.price).toFixed(2)}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => increment(item.id)}
                  className="px-2 py-1 border rounded"
                  aria-label={`Increase ${item.name}`}
                >
                  +
                </button>
                <button
                  onClick={() => decrement(item.id)}
                  className="px-2 py-1 border rounded"
                  aria-label={`Decrease ${item.name}`}
                >
                  −
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${item.name}?`)) removeItem(item.id);
                  }}
                  className="px-2 py-1 text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-center mt-4">
        <p className="text-xl font-bold">Total: ${totalPrice.toFixed(2)}</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (confirm("Clear cart?")) clearCart();
            }}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Clear Cart
          </button>
          <button
            onClick={() => {
              // If guest, redirect to login with redirect back to checkout.
              if (!isAuthenticated) {
                router.push(`/login?redirect=${encodeURIComponent("/shop/checkout")}`);
                return;
              }
              router.push("/shop/checkout");
            }}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </main>
  );
}
