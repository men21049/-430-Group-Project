"use client";

import { useState } from "react";
import PasswordInput from "./password-input";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Login failed");
      } else {
        setMessage("✅ Login successful!");

        // Save cookies for auth and cart
        Cookies.set("token", data.token || "dummy-token", { expires: 1 });
        Cookies.set("role", data.user.role);
        Cookies.set("name", data.user.name);
        Cookies.set("userId", data.user.id); // ✅ crucial for checkout

        // Redirect based on role
        switch (data.user.role) {
          case "SELLER":
            router.push("/seller/dashboard");
            break;
          case "CUSTOMER":
            router.push("/customer/dashboard");
            break;
          default:
            router.push("/");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("⚠️ Network or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fef5ef] p-6">
      <a href="/" className="text-[#9d5c63] hover:underline mb-4">← Back to Home</a>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9d5c63] focus:outline-none"
        />

        <PasswordInput
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-md font-semibold text-white bg-[#FF8C42] hover:bg-[#584b53] transition disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {message && <p className="text-center text-sm text-gray-700 mt-2">{message}</p>}

        <div className="text-center mt-4 space-x-2 text-sm">
          <span>Don't have an account?</span>
          <Link href="/signup/customer" className="text-[#9d5c63] hover:underline">
            Sign Up as Customer
          </Link>
          <span>|</span>
          <Link href="/signup/seller" className="text-[#9d5c63] hover:underline">
            Sign Up as Seller
          </Link>
        </div>
      </form>
    </div>
  );
}
