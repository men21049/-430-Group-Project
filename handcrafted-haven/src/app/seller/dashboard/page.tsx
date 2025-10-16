// handcrafted-haven/src/app/seller/dashboard/page.tsx
"use client";

import Header from "@/app/ui/landing-page/header";
import CallToAction from "@/app/ui/landing-page/cta-section";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

export default function SellerDashboard() {
  return <DashboardContent />;
}

function DashboardContent() {
  const router = useRouter();

  const handleViewProducts = () => router.push("/seller/products");
  const handleManageProducts = () => router.push("/seller/dashboard/manage");
  const handleShop = () => router.push("/shop");
  
  const debugCookies = () => {
    console.log("🍪 All cookies:", document.cookie);
    console.log("🍪 Token:", Cookies.get("token"));
    console.log("🍪 Role:", Cookies.get("role"));
    console.log("🍪 Name:", Cookies.get("name"));
    console.log("🍪 UserId:", Cookies.get("userId"));
  };

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Seller Dashboard</h1>
        <p className="mb-6">Welcome! Manage your products and shop here.</p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleShop}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 active:scale-95 transition transform duration-150"
          >
            View All Products
          </button>
          <button
            onClick={handleManageProducts}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 active:scale-95 transition transform duration-150"
          >
            Manage My Products
          </button>

          <button
            onClick={handleViewProducts}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 active:scale-95 transition transform duration-150"
          >
            View My Products
          </button>

          <Link
            href="/seller/orders"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 active:scale-95 transition transform duration-150"
          >
            View Orders / Invoices
          </Link>
        </div>
      </div>
      <CallToAction />
    </div>
  );
}
