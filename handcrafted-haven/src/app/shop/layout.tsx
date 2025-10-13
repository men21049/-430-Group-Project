// src/app/shop/layout.tsx
// Keep this a simple layout — DO NOT re-wrap with CartProvider here.
// This file should NOT create a new CartProvider instance.

import React from "react";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shop-layout min-h-screen">
      {children}
    </div>
  );
}
