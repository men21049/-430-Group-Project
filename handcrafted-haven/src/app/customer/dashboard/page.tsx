"use client";

import WithAuth from "@/app/components/withAuth";
import Header from '@/app/ui/landing-page/header';
import Footer from '@/app/ui/footer';
import CallToAction from '@/app/ui/landing-page/cta-section';
import { useState } from "react";
import Link from "next/link";

export default function CustomerDashboard() {
  return (
    <WithAuth role="CUSTOMER">
      <DashboardContent />
    </WithAuth>
  );
}

function DashboardContent() {
  const [pressed, setPressed] = useState(false);

  const handleClick = (href: string) => {
    setPressed(true);
    setTimeout(() => setPressed(false), 180);
    window.location.href = href;
  };

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to Handcrafted Haven</h1>
        <p>Browse and discover handmade treasures!</p>

        <div className="mt-4 flex gap-4">
          <button
            onClick={() => handleClick("/shop")}
            className={`px-4 py-2 bg-orange-500 text-white rounded transition-transform transform
              hover:scale-105 active:scale-95 shadow-md
              ${pressed ? "scale-95 bg-orange-600" : ""}`}
          >
            Go to Shop
          </button>

          {/* 
          <Link href="/seller/products">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition transform hover:scale-105 active:scale-95"
            >
              Manage My Products
            </button>
          </Link>
          */}
          {/* "Manage My Products" is commented out for customers */}
        </div>
      </div>
      <CallToAction />
      <Footer />
    </div>
  );
}
