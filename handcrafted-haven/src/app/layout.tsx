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

function HeaderBar({ onOpenCart }: { onOpenCart: () => void }) {
  // useCart is available because HeaderBar is rendered inside CartProvider
  const { isAuthenticated } = useCart();
  const router = useRouter();

  const handleCartClick = () => {
    // If explicitly authenticated -> open drawer
    if (isAuthenticated === true) {
      onOpenCart();
      return;
    }

    // If explicitly unauthenticated -> go to login
    if (isAuthenticated === false) {
      router.push("/login");
      return;
    }

    // isAuthenticated === null -> auth is still resolving
    // Do nothing (conservative). Optionally you could show a toast or small loader.
    return;
  };

  return (
    <header className="w-full border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Handcrafted Haven
          </Link>

          {/* Public nav */}
          <nav className="hidden md:flex gap-4">
            <Link href="/shop" className="text-sm hover:underline">
              Shop
            </Link>
            <Link href="/shop/orders" className="text-sm hover:underline">
              Orders
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* pass a disabled prop to the button so it looks inactive while checking */}
          <CartButton onClick={handleCartClick} disabled={isAuthenticated !== true} />
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {/* HeaderBar is inside provider so it can access useCart() */}
          <HeaderBar onOpenCart={() => setCartOpen(true)} />

          <main>{children}</main>

          {/* Only render drawer UI; HeaderBar prevents opening for unauthenticated */}
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </CartProvider>
      </body>
    </html>
  );
}
