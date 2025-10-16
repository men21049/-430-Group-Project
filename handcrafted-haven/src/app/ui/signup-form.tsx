"use client";

import { useState } from "react";
import PasswordInput from "./password-input";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

type SignupProps = {
  role: "CUSTOMER" | "SELLER";
};

export default function SignupForm({ role }: SignupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Use specific endpoint based on role
      const endpoint = role === "CUSTOMER" ? "/api/signup/customer" : "/api/signup/seller";
      const body = role === "CUSTOMER" 
        ? { name, email, password }
        : { name, email, password, shopName, bio };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Signup failed");
      } else {
        setMessage(data.message || "✅ Signup successful!");

        // Handle redirection based on response
        if (data.redirectTo === "/login") {
          // Customer signup - redirect to success page
          // Clear any existing cookies
          Cookies.remove("token");
          Cookies.remove("role");
          Cookies.remove("userId");
          Cookies.remove("name");
          
          // Redirect to success page
          router.push("/signup/success");
        } else if (data.token) {
          // Seller signup - auto-login
          // Save cookies for auth and cart
          Cookies.set("token", data.token, { expires: 1 });
          if (data.user.role) Cookies.set("role", data.user.role);
          if (data.user.id) Cookies.set("userId", data.user.id);
          Cookies.set("name", data.user.name);

          // Redirect to seller dashboard
          router.push("/seller/dashboard");
        }
      }
    } catch (err) {
      console.error("SignupForm error:", err);
      setMessage("⚠️ Network or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9d5c63] focus:outline-none"
      />

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

      {role === "SELLER" && (
        <>
          <input
            type="text"
            placeholder="Shop Name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9d5c63] focus:outline-none"
          />
          <textarea
            placeholder="Bio / Description"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9d5c63] focus:outline-none"
          />
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-md font-semibold text-white bg-[#FF8C42] hover:bg-[#584b53] transition disabled:opacity-70"
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      {message && <p className="text-center text-sm text-gray-700 mt-2">{message}</p>}
    </form>
  );
}
