"use client";

import Link from "next/link";
import AuthHeader from "@/app/ui/auth-header";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fef5ef] p-6">
      {/* Logo + Welcome */}
      <AuthHeader
        title="Create an Account"
        subtitle="Join Handcrafted Haven to discover and sell handmade treasures"
      />

      <div className="space-y-4 w-full max-w-sm mt-4">
        <Link
          href="/signup/customer"
          className="block w-full py-3 rounded-md text-center font-semibold text-white bg-[#FF8C42] hover:bg-[#584b53] transition"
        >
          Sign up as Customer
        </Link>
        <Link
          href="/signup/seller"
          className="block w-full py-3 rounded-md text-center font-semibold text-white bg-[#9d5c63] hover:bg-[#584b53] transition"
        >
          Sign up as Seller
        </Link>
      </div>
    </div>
  );
}
