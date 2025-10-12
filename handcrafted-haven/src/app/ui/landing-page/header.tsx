// src/app/ui/landing-page/header.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import NavigationBar from "@/app/ui/sidenav";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import Search from "../search";

type AuthUser = {
  id?: string;
  name?: string;
  role?: string;
};

export default function Header() {
  const router = useRouter();
  const [hideHeader, setHideHeader] = useState(false);
  const lastScrollRef = useRef<number>(0);

  // Sign-in button pressed state for click animation
  const [pressed, setPressed] = useState(false);

  // Auth state fetched from server (more reliable than trusting client-only cookies)
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function loadUser() {
      setAuthLoading(true);
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          setUser(null);
          setAuthLoading(false);
          return;
        }
        const data = await res.json();
        const u = (data && (data.user ?? data.payload)) || null;
        if (u) {
          setUser({
            id: u.id ?? u.userId,
            name: u.name ?? u.email ?? "",
            role:
              (u.role ?? (data.payload?.role ?? "")).toString().toUpperCase?.() ??
              "",
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    loadUser();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      if (currentScroll > lastScrollRef.current && currentScroll > 100) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }
      lastScrollRef.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignIn = () => {
    setPressed(true);
    setTimeout(() => {
      setPressed(false);
      if (user && user.id) {
        const role = (user.role ?? "").toUpperCase();
        if (role === "SELLER") router.push("/seller/dashboard");
        else if (role === "ADMIN") router.push("/admin");
        else router.push("/account");
      } else {
        router.push("/login");
      }
    }, 150);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSignIn();
    }
  };

  const handleLogout = () => {
    try {
      fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    } finally {
      try {
        document.cookie = "token=; Max-Age=0; path=/";
        document.cookie = "authToken=; Max-Age=0; path=/";
        document.cookie = "access_token=; Max-Age=0; path=/";
        document.cookie = "role=; Max-Age=0; path=/";
        document.cookie = "id=; Max-Age=0; path=/";
      } catch (e) {}
      setUser(null);
      router.push("/login");
    }
  };

  const role = user?.role ?? null;
  const userId = user?.id ?? null;

  const sellerProductsHref = role === "SELLER" || role === "ADMIN" ? "/seller/products" : "/shop";
  const sellerDashboardHref = role === "SELLER" ? "/seller/dashboard" : role === "ADMIN" ? "/admin" : "/account";
  const ordersHref =
    role === "SELLER" ? "/seller/orders" : role === "ADMIN" ? "/admin/orders" : null; // hide Orders for customers

  return (
    <header
      className={clsx(
        "sticky top-0 flex items-center gap-3 p-4 bg-white shadow-md transition-transform duration-300 ease-in-out",
        hideHeader ? "-translate-y-full" : "translate-y-0",
        "z-[9999]"
      )}
    >
      <NavigationBar />

      <div className="flex items-center gap-4">
        <a href="/" className="inline-flex items-center" aria-label="Home">
          <Image
            src={"/transparent-logo.png"}
            alt={"Handcrafted Haven logo"}
            width={96}
            height={40}
            className="object-contain"
            priority
          />
        </a>
      </div>

      <div className="flex-1 px-4">
        <Search placeholder="Search anything..." className="w-full" />
      </div>

      <nav className="flex items-center gap-3">
        <a href="/shop" className="text-sm text-gray-600 hover:text-gray-900">
          Shop
        </a>

        {/* Products/Dashboard/Orders links adapt to role */}
        <a href={sellerProductsHref} className="text-sm text-gray-600 hover:text-gray-900">
          {role === "SELLER" || role === "ADMIN" ? "My Products" : "Products"}
        </a>

        <a href={sellerDashboardHref} className="text-sm text-gray-600 hover:text-gray-900">
          Dashboard
        </a>

        {ordersHref && (
          <a href={ordersHref} className="text-sm text-gray-600 hover:text-gray-900">
            Orders
          </a>
        )}
      </nav>

      <div className="flex items-center gap-3 ml-4">
        {!authLoading && user && user.id ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (role === "SELLER") router.push("/seller/profile");
                else if (role === "ADMIN") router.push("/admin");
                else router.push("/account");
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-transform duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-100"
              aria-label="Account"
            >
              <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="hidden sm:inline">{user.name ?? "Account"}</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm rounded-md text-red-600 border border-red-100 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            onKeyDown={handleKey}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            aria-label="Sign in"
            className={clsx(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-transform duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2",
              "bg-gradient-to-r from-[#FF8C42] to-[#ff7b1f] text-white shadow-md",
              "hover:-translate-y-[1px] hover:shadow-lg",
              pressed ? "scale-95 bg-gradient-to-r from-[#ff7b1f] to-[#ff6a00] shadow-sm" : ""
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v4" />
              <path d="M10 14L21 3" />
              <path d="M21 21H3a2 2 0 0 1-2-2V5" />
              <path d="M11 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            </svg>

            <span className="select-none">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
