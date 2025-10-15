"use client";

import { useState, useEffect } from "react";
import Header from "@/app/ui/landing-page/header";

import CallToAction from "@/app/ui/landing-page/cta-section";
import Image from "next/image";
import { getSellerInfo } from "@/app/lib/data";
import WithAuth from "@/app/components/withAuth";

function SellerProfileContent() {
  const [seller, setSeller] = useState({
    name: "",
    logo: "",
    banner: "",
    bio: "",
  });

  useEffect(() => {
    async function loadSeller() {
      // Replace with actual logged-in seller ID from cookie or token
      const info = await getSellerInfo("seller1");
      setSeller(info);
    }
    loadSeller();
  }, []);

  return (
    <div>
      <Header />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>

        <div className="relative w-full h-60 rounded-lg overflow-hidden mb-6">
          {seller.banner ? (
            <Image
              src={seller.banner}
              alt={`${seller.name} banner`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="bg-gray-200 h-full flex items-center justify-center text-gray-500">
              No banner uploaded
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center">
          {seller.logo && (
            <Image
              src={seller.logo}
              alt={`${seller.name} logo`}
              width={120}
              height={120}
              className="rounded-full border shadow"
            />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">{seller.name}</h2>
            <p className="text-gray-600 mb-4">{seller.bio}</p>

            <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
      <CallToAction />
    </div>
  );
}

export default function SellerProfilePage() {
  return (
    <WithAuth role="SELLER">
      <SellerProfileContent />
    </WithAuth>
  );
}
