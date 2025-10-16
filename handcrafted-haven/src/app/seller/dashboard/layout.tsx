"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Layout({children}: {children: React.ReactNode}) {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    console.log("🔍 Dashboard Layout - Token:", !!token);
    console.log("🔍 Dashboard Layout - Role:", role);
    console.log("🔍 Dashboard Layout - All cookies:", document.cookie);
    console.log("🔍 Dashboard Layout - Current path:", window.location.pathname);

    if (!token) {
      console.log("🔍 No token - redirecting to login");
      router.push("/login");
      return;
    }

    if (role && role.toUpperCase() !== "SELLER" && role.toUpperCase() !== "ADMIN") {
      console.log("🔍 Invalid role - redirecting to login");
      router.push("/login");
      return;
    }

    console.log("🔍 Access granted to dashboard");
  }, [router]);

  return (
    <main className="pt-16">
      {children}
    </main>
  );
}
