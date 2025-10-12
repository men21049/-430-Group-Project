"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type WithAuthProps = {
  role?: string | string[];
  children: React.ReactNode;
};

export default function WithAuth({ role, children }: WithAuthProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function verify() {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          if (mounted) router.push("/login");
          return;
        }

        const data = await res.json();
        const userRoleRaw = data?.user?.role ?? data?.payload?.role ?? null;
        const userId = data?.user?.id ?? data?.payload?.userId ?? null;

        if (!userId) {
          if (mounted) router.push("/login");
          return;
        }

        // Only enforce role if explicitly provided
        if (role) {
          const allowed = Array.isArray(role) ? role : [role];
          const allowedUpper = allowed.map((r) => (r + "").toUpperCase());
          const userRole = userRoleRaw ? (userRoleRaw + "").toUpperCase() : "";

          if (!allowedUpper.includes(userRole)) {
            if (mounted) router.push("/login");
            return;
          }
        }

        if (mounted) setAuthorized(true);
      } catch (err) {
        console.error("WithAuth verify error:", err);
        if (mounted) router.push("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    verify();
    return () => {
      mounted = false;
    };
  }, [role, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Verifying session…</div>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
