"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear cookies
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("name");

    // Redirect to homepage
    router.push("/");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-700">Logging out...</p>
    </div>
  );
}
