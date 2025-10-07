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
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, shopName, bio }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Signup failed");
      } else {
        setMessage("✅ Signup successful! Logging in...");

        // Save token, role and userId
        if (data.token) Cookies.set("token", data.token, { expires: 1 });
        if (data.role) Cookies.set("role", data.role);
        if (data.userId) Cookies.set("userId", data.userId);
        Cookies.set("name", name);

        // Redirect based on role
        if (role === "SELLER") router.push("/seller/dashboard");
        else router.push("/customer/dashboard");
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
      {/* Name */}
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9d5c63] focus:outline-none"
      />

      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9d5c63] focus:outline-none"
      />

      {/* Password */}
      <PasswordInput
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      {/* Seller extra fields */}
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

      {/* Submit */}
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
