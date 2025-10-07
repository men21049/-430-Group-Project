// src/app/ui/landing-page/header.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import NavigationBar from "@/app/ui/sidenav";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import Search from "../search";

export default function Header() {
  const router = useRouter();
  const [hideHeader, setHideHeader] = useState(false);
  const lastScrollRef = useRef<number>(0);

  // Sign-in button pressed state for click animation
  const [pressed, setPressed] = useState(false);

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

  // Navigate to login with small press animation
  const handleSignIn = () => {
    setPressed(true);
    // short press animation then navigate
    setTimeout(() => {
      setPressed(false);
      router.push("/login");
    }, 150);
  };

  // keyboard activation
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSignIn();
    }
  };

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
        <a href="/" className="inline-flex items-center">
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

      <div className="flex items-center gap-3">
        {/* Sign In button with hover + pressed animations */}
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
            // base styles
            "bg-gradient-to-r from-[#FF8C42] to-[#ff7b1f] text-white shadow-md",
            // hover
            "hover:translate-y-[-1px] hover:shadow-lg",
            // pressed (active)
            pressed ? "scale-95 bg-gradient-to-r from-[#ff7b1f] to-[#ff6a00] shadow-sm" : ""
          )}
        >
          {/* simple SVG icon (no external deps) */}
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
      </div>
    </header>
  );
}
