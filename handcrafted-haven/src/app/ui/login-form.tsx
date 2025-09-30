"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // 👈 import icons
import PasswordInput from "@/app/ui/password-input";


export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 toggle state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9d5c63] focus:outline-none"
      />

      {/* Password with Eye Icon */}
      <div className="relative">
        <PasswordInput
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Forgot Password */}
      <div className="flex justify-between text-sm">
        <a href="#" className="text-[#9d5c63] hover:underline">
          Forgot Password
        </a>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-2 rounded-md font-semibold text-white bg-[#FF8C42] hover:bg-[#584b53] transition"
      >
        Sign In
      </button>

      {/* Sign Up Options */}
      <p className="text-sm text-center text-gray-600">
        Don’t have an account?{" "}
        <a href="/signup" className="text-[#9d5c63] font-semibold hover:underline">
          Sign up
        </a>{" "}
        as a{" "}
        <a href="/signup/customer" className="text-[#9d5c63] hover:underline">
          Customer
        </a>{" "}
        or{" "}
        <a href="/signup/seller" className="text-[#9d5c63] hover:underline">
          Seller
        </a>
      </p>
    </form>
  );
}
