"use client";

// src/app/account/page.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WithAuth from "@/app/components/withAuth";
import CustomerDashboard from "@/app/customer/dashboard/page";
import SellerDashboard from "@/app/shop/seller/dashboard/page";

// Minimal placeholder for admin
function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, Admin! Management links will appear here.</p>
    </div>
  );
}

export default function AccountPageWrapper() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data.payload);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  if (loading) {
    return <p className="text-center py-20">Loading...</p>;
  }

  if (!user) {
    return <p className="text-center py-20">Please log in to view your account.</p>;
  }

  let DashboardComponent;
  switch (user.role) {
    case "CUSTOMER":
      DashboardComponent = <CustomerDashboard />;
      break;
    case "SELLER":
      DashboardComponent = <SellerDashboard />;
      break;
    case "ADMIN":
      DashboardComponent = <AdminDashboard />;
      break;
    default:
      DashboardComponent = (
        <p className="text-center py-20">Unknown role. Contact support.</p>
      );
  }

  return (
    <WithAuth>
      <div className="min-h-screen flex flex-col">{DashboardComponent}</div>
    </WithAuth>
  );
}
