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
import Cookies from "js-cookie";

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
  const handleOrdersClick = (e: React.MouseEvent, role: string) => {
    e.preventDefault();

    if (role === "SELLER") {
      router.push("/seller/orders");
    } else if (role === "ADMIN") {
      router.push("/admin/orders");
    }
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

            {/* Orders link protected by authentication check and role */}
            {isAuthenticated === true && (() => {
              const rawRole = Cookies.get("role");
              const role = rawRole ? rawRole.toUpperCase() : null;
              // hide Orders for customers
              if (role === "CUSTOMER") return null;
              return (
                <a
                  href="#orders"
                  onClick={(e) => handleOrdersClick(e, role)}
                  className="text-sm hover:underline transition-opacity"
                >
                  Orders
                </a>
              );
            })()}
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
