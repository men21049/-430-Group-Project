"use client";

import { useState, useEffect } from "react";
import PasswordInput from "@/app/ui/password-input";
import AuthHeader from "@/app/ui/auth-header";
import NavigationBar from "@/app/ui/sidenav";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function SignUpCustomerPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (token && role) {
      if (role === "CUSTOMER") router.push("/customer/dashboard");
      else if (role === "SELLER") router.push("/seller/dashboard");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "CUSTOMER" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Signup failed");
      } else {
        // Save JWT and user info in cookies
        Cookies.set("token", data.token, { expires: 1 });
        Cookies.set("role", data.role);
        if (data.userId) Cookies.set("userId", data.userId);
        Cookies.set("name", data.name || form.name);

        setMessage("✅ Account created! Redirecting...");
        router.push("/customer/dashboard");
      }
    } catch (err) {
      console.error("Signup (customer) error:", err);
      setMessage("⚠️ Network or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#d6e3f8] p-6">
      <NavigationBar />
      <div className="flex items-center justify-center flex-1">
        <form className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 space-y-4" onSubmit={handleSubmit}>
          <AuthHeader
            title="Customer Sign Up"
            subtitle="Join Handcrafted Haven to discover handmade treasures"
          />

          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9d5c63] focus:outline-none"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9d5c63] focus:outline-none"
          />

          <PasswordInput
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md font-semibold text-white bg-[#FF8C42] hover:bg-[#584b53] transition disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {message && <p className="text-center text-sm text-gray-700 mt-2">{message}</p>}
        </form>
      </div>
    </div>
  );
}
