"use client";

import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import { CartProvider } from "@/app/context/CartContext";
import CartDrawer from "@/app/ui/CartDrawer";
import CartButton from "@/app/ui/CartButton";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import LoadingSpinner from "@/app/ui/loading-spinner";

// =======================
// 🔹 Header Component
// =======================
function HeaderBar({ onOpenCart }: { onOpenCart: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    const storedRole = Cookies.get("role");
    setIsAuthenticated(!!token);
    setRole(storedRole || null);
  }, []);

  const handleCartClick = () => {
    if (isAuthenticated) onOpenCart();
    else router.push("/login");
  };

  const handleOrdersClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return router.push("/login");

    const normalizedRole = role?.toUpperCase();
    if (normalizedRole === "SELLER") router.push("/seller/orders");
    else if (normalizedRole === "ADMIN") router.push("/admin/orders");
    // Customers do not see Orders — do nothing
  };

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Handcrafted Haven
          </Link>

          <nav className="hidden md:flex gap-4">
            <Link href="/shop" className="text-sm hover:underline">
              Shop
            </Link>

            {isAuthenticated && role !== "CUSTOMER" && (
              <a
                href="#orders"
                onClick={handleOrdersClick}
                className="text-sm hover:underline"
              >
                Orders
              </a>
            )}
          </nav>
        </div>

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

// =======================
// 🔹 Page Loader
// =======================
function PageLoader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = () => setLoading(true);
    const stop = () => setLoading(false);

    router.events?.on("routeChangeStart", start);
    router.events?.on("routeChangeComplete", stop);
    router.events?.on("routeChangeError", stop);

    return () => {
      router.events?.off("routeChangeStart", start);
      router.events?.off("routeChangeComplete", stop);
      router.events?.off("routeChangeError", stop);
    };
  }, [router]);

  return loading ? (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white/70 z-50">
      <LoadingSpinner text="Loading page..." />
    </div>
  ) : null;
}

// =======================
// 🔹 Root Layout
// =======================
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
          <HeaderBar onOpenCart={() => setCartOpen(true)} />
          <PageLoader />
          <main>{children}</main>

          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

          {/* ✅ Single Global Footer */}
          <footer className="border-t mt-12 py-6 text-center text-sm text-gray-600 bg-gray-50">
            © {new Date().getFullYear()} Handcrafted Haven. All rights reserved.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
