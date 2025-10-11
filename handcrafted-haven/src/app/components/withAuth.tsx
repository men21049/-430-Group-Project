"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

type WithAuthProps = {
  children: ReactNode;
  role?: "CUSTOMER" | "SELLER"; // optional role restriction
};

export default function WithAuth({ children, role }: WithAuthProps) {
  const router = useRouter();

  // Check immediately before render
  const token = Cookies.get("token");
  const userRole = Cookies.get("role");

  // If no token or wrong role, redirect immediately (before render)
  if (!token || (role && userRole !== role)) {
    if (typeof window !== "undefined") router.replace("/login");
    return null; // prevent any flicker
  }

  // Only render when authorized
  return <>{children}</>;
}
