// src/app/ui/sidenav.tsx
"use client";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type AuthUser = {
  id?: string;
  name?: string;
  role?: string;
};

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function loadUser() {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me", { credentials: "include", signal: controller.signal });
        if (!res.ok) {
          if (mounted) setUser(null);
          return;
        }
        const data = await res.json();
        const u = data?.user ?? data?.payload ?? null;
        if (mounted && u) {
          setUser({
            id: u.id ?? u.userId,
            name: u.name ?? u.email ?? "",
            role: (u.role ?? (data.payload?.role ?? "")).toString().toUpperCase?.() ?? "",
          });
        } else if (mounted) {
          setUser(null);
        }
      } catch (err) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUser();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const toggleMenu = () => setIsOpen((s) => !s);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore
    } finally {
      // best-effort client clear
      try {
        document.cookie = "token=; Max-Age=0; path=/";
        document.cookie = "authToken=; Max-Age=0; path=/";
        document.cookie = "access_token=; Max-Age=0; path=/";
        document.cookie = "role=; Max-Age=0; path=/";
        document.cookie = "id=; Max-Age=0; path=/";
      } catch {}
      setUser(null);
      router.push("/login");
    }
  };

  const role = user?.role ?? null;
  const ordersHref = role === "SELLER" ? "/seller/orders" : role === "ADMIN" ? "/admin/orders" : "/orders";
  const productsHref = role === "SELLER" || role === "ADMIN" ? "/seller/products" : "/shop";
  const dashboardHref = role === "SELLER" ? "/seller/dashboard" : role === "ADMIN" ? "/admin" : "/";

  return (
    <div>
      {/* Hamburger icon */}
      <span className="cursor-pointer bg-gray-200 p-1 rounded" aria-label="Open menu">
        <Bars3Icon onClick={toggleMenu} className="w-6 h-6" />
      </span>

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed inset-0 top-0 left-0 h-[100dvh] w-1/2 lg:w-1/4 p-4 flex flex-col bg-white items-start z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full flex items-center justify-between mb-4">
          <div className="font-semibold">Menu</div>
          <XMarkIcon onClick={toggleMenu} className="w-5 h-5 cursor-pointer" />
        </div>

        <nav className="w-full flex flex-col gap-2">
          <Link href="/shop" className={linkClass(pathname === "/shop")}>Shop</Link>

          <Link href={productsHref} className={linkClass(pathname?.startsWith("/seller") || pathname?.startsWith("/shop"))}>
            {role === "SELLER" || role === "ADMIN" ? "My Products" : "Products"}
          </Link>

          <Link href={dashboardHref} className={linkClass(pathname?.startsWith("/seller") || pathname?.startsWith("/admin"))}>
            Dashboard
          </Link>

          <Link href={ordersHref} className={linkClass(pathname?.includes("/orders"))}>
            Orders
          </Link>

          <Link href="/cart" className={linkClass(pathname === "/cart")}>Cart</Link>

          {!loading && !user && (
            <>
              <Link href="/login" className={linkClass(pathname === "/login")}>Login</Link>
              <Link href="/register" className={linkClass(pathname === "/register")}>Join</Link>
            </>
          )}

          {!loading && user && (
            <>
              <Link href={role === "SELLER" ? "/seller/profile" : "/account"} className={linkClass(false)}>
                Profile
              </Link>
              <button onClick={handleSignOut} className="text-left text-red-600 text-sm px-2 py-1 rounded hover:bg-red-50">
                Logout
              </button>
            </>
          )}
        </nav>

        {/* small spacer to push content up */}
        <div className="flex-1" />

        {/* optionally show user at bottom */}
        <div className="w-full text-sm text-gray-500 mt-4">
          {loading ? "Checking session…" : user ? `Signed in as ${user.name}` : "Not signed in"}
        </div>
      </div>

      {/* Overlay */}
      <div
        onClick={toggleMenu}
        className={clsx(
          "fixed top-0 left-0 h-dvh w-full z-40 bg-black/20 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
    </div>
  );
}

function linkClass(active?: boolean) {
  return `block px-3 py-2 rounded w-full ${active ? "bg-gray-100 font-semibold" : "text-gray-700 hover:bg-gray-50"}`;
}
