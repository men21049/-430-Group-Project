// src/app/ui/sidenav.tsx
"use client";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import clsx from "clsx";
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

  // Prevent scrolling when sidenav is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  // Fetch current user
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
      } catch {
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
    } catch {}
    finally {
      try {
        document.cookie = "token=; Max-Age=0; path=/";
        document.cookie = "authToken=; Max-Age=0; path=/";
        document.cookie = "access_token=; Max-Age=0; path=/";
        document.cookie = "role=; Max-Age=0; path=/";
        document.cookie = "id=; Max-Age=0; path=/";
      } catch {}
      setUser(null);
      router.push("/"); // redirect to landing page
    }
  };

  const role = user?.role ?? null;
  const ordersHref = role === "SELLER" ? "/seller/orders" : role === "ADMIN" ? "/admin/orders" : "/orders";
  const productsHref = role === "SELLER" || role === "ADMIN" ? "/seller/products" : "/shop";
  const dashboardHref = role === "SELLER" ? "/seller/dashboard" : role === "ADMIN" ? "/admin" : "/";

  const handleLinkClick = (href: string) => {
    setIsOpen(false); // close menu immediately
    router.push(href);
  };

  return (
    <div>
      {/* Hamburger icon */}
      <span className="cursor-pointer p-1 rounded" aria-label="Open menu">
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
          <button onClick={() => handleLinkClick("/shop")} className={linkClass(pathname === "/shop")}>Shop</button>

          <button
            onClick={() => handleLinkClick(productsHref)}
            className={linkClass(pathname?.startsWith("/seller") || pathname?.startsWith("/shop"))}
          >
            {role === "SELLER" || role === "ADMIN" ? "My Products" : "Products"}
          </button>

          <button
            onClick={() => handleLinkClick(dashboardHref)}
            className={linkClass(pathname?.startsWith("/seller") || pathname?.startsWith("/admin"))}
          >
            Dashboard
          </button>

          {/* Only show Orders for SELLER or ADMIN */}
          {(role === "SELLER" || role === "ADMIN") && (
            <button
              onClick={() => handleLinkClick(ordersHref)}
              className={linkClass(pathname?.includes("/orders"))}
            >
              Orders
            </button>
          )}

          <button onClick={() => handleLinkClick("/cart")} className={linkClass(pathname === "/cart")}>Cart</button>

          {!loading && !user && (
            <>
              <button onClick={() => handleLinkClick("/login")} className={linkClass(pathname === "/login")}>Login</button>
              <button onClick={() => handleLinkClick("/signup/customer")} className={linkClass(pathname === "/signup/customer")}>Join</button>
            </>
          )}

          {!loading && user && (
            <>
              <button onClick={() => handleLinkClick(role === "SELLER" ? "/seller/profile" : "/account")} className={linkClass(false)}>
                Profile
              </button>
              <button onClick={handleSignOut} className="text-left text-red-600  px-2 py-1 rounded hover:bg-red-50">
                Logout
              </button>
            </>
          )}
        </nav>

        <div className="flex-1" />
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
  return `block px-3 py-2 rounded w-full text-left ${active ? "bg-gray-100 font-semibold" : "text-gray-700 hover:bg-gray-50"}`;
}
