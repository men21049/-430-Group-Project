// src/app/components/withAuth.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Props:
 * - role?: string | string[]   (e.g. "SELLER" or ["SELLER", "ADMIN"])
 * - children: React.ReactNode
 *
 * Behavior:
 * - Calls GET /api/auth/me with credentials included to validate session.
 * - If unauthenticated -> redirect to /login
 * - If role provided but user.role not allowed -> redirect to /login (or you can change to /unauthorized)
 * - Shows a simple loading state while validating.
 */
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
          headers: { "Accept": "application/json" },
        });

        if (!res.ok) {
          // not authenticated -> redirect to login
          if (mounted) {
            router.push("/login");
          }
          return;
        }

        const data = await res.json();
        // data.user or data.payload
        const userRoleRaw = data?.user?.role ?? data?.payload?.role ?? null;
        const userId = data?.user?.id ?? data?.payload?.userId ?? null;

        if (!userId) {
          if (mounted) router.push("/login");
          return;
        }

        // If role check provided, normalize and check
        if (role) {
          const allowed = Array.isArray(role) ? role : [role];
          const allowedUpper = allowed.map((r) => (r + "").toUpperCase());
          const userRole = userRoleRaw ? (userRoleRaw + "").toUpperCase() : "";

          if (!allowedUpper.includes(userRole)) {
            // unauthorized
            if (mounted) router.push("/login");
            return;
          }
        }

        if (mounted) {
          setAuthorized(true);
        }
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

  if (!authorized) {
    // If not authorized, the effect above already redirected.
    return null;
  }

  return <>{children}</>;
}
