"use client";

import { Suspense } from "react";
import LoginForm from "@/app/ui/login-form";
import AuthHeader from "@/app/ui/auth-header";
import NavigationBar from "@/app/ui/sidenav"; // ✅ import navbar

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fef5ef]">
      <NavigationBar /> {/* ✅ Add navbar */}
      <div className="flex items-center justify-center flex-1">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <AuthHeader
            title="Welcome"
            subtitle="Sign in to discover handmade treasures"
          />
          <Suspense fallback={<div>Loading login form...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
