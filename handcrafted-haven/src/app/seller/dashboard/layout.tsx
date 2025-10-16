"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Navigation from './navigation';

export default function Layout({children}: {children: React.ReactNode}) {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");


    if (!token) {
      router.push("/login");
      return;
    }

    if (role && role.toUpperCase() !== "SELLER" && role.toUpperCase() !== "ADMIN") {
      router.push("/login");
      return;
    }

  }, [router]);

  return (
    <main className="pt-16">
      <Navigation />
      {children}
    </main>
  );
}
