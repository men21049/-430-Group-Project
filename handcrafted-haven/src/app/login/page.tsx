"use client";

import { Suspense } from "react";
import Image from "next/image"; // optional, AuthHeader handles this
import LoginForm from "@/app/ui/login-form";
import AuthHeader from "@/app/ui/auth-header";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fef5ef]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Use AuthHeader instead of hardcoded div */}
        <AuthHeader
          title="Welcome"
          subtitle="Sign in to discover handmade treasures"
        />
        <Suspense fallback={<div>Loading login form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
