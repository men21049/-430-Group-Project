// src/app/layout.tsx
"use client";

import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import { CartProvider, useCart } from "@/app/context/CartContext";
import CartDrawer from "@/app/ui/CartDrawer";
import CartButton from "@/app/ui/CartButton";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // ✅ Add this import

function HeaderBar({ onOpenCart }: { onOpenCart: () => void }) {
  const { isAuthenticated } = useCart();
  const router = useRouter();

  // 🛒 Handles cart drawer access depending on authentication
  const handleCartClick = () => {
    if (isAuthenticated === true) {
      onOpenCart();
      return;
    }
    if (isAuthenticated === false) {
      router.push("/login");
      return;
    }
    // If null (still loading), do nothing
  };

  // 📦 Handles Orders link access depending on authentication & role
  const handleOrdersClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isAuthenticated === true) {
      const rawRole = Cookies.get("role"); // ✅ get role from cookie
      const role = rawRole ? rawRole.toUpperCase() : null;

      if (role === "SELLER") {
        router.push("/seller/orders");
        return;
      }

      if (role === "ADMIN") {
        router.push("/admin/orders");
        return;
      }

      // default for regular users/customers
      router.push("/shop/orders");
      return;
    }

    if (isAuthenticated === false) {
      router.push("/login");
      return;
    }

    // If null (still loading), ignore click
  };

  return (
    <header className="w-full border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Handcrafted Haven
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex gap-4">
            <Link href="/shop" className="text-sm hover:underline">
              Shop
            </Link>

            {/* Orders link protected by authentication check */}
            <a
              href="#orders"
              onClick={handleOrdersClick}
              className={`text-sm hover:underline transition-opacity ${
                isAuthenticated === false || isAuthenticated === null
                  ? "opacity-70 cursor-pointer"
                  : ""
              }`}
            >
              Orders
            </a>
          </nav>
        </div>

        {/* Cart button */}
        <div className="flex items-center gap-3">
          <CartButton
            onClick={handleCartClick}
            disabled={isAuthenticated !== true}
          />
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {/* Header is wrapped in CartProvider so useCart() works */}
          <HeaderBar onOpenCart={() => setCartOpen(true)} />

          <main>{children}</main>

          {/* Drawer remains but access is controlled by HeaderBar */}
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </CartProvider>
      </body>
    </html>
  );
}
