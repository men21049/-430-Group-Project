"use client";

import { useState } from "react";
import PasswordInput from "@/app/ui/password-input";
import AuthHeader from "@/app/ui/auth-header";

export default function SignUpSellerPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    shopName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Seller Sign Up:", form);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fef5ef] p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 space-y-4"
      >
        <AuthHeader
          title="Seller Sign Up"
          subtitle="Join Handcrafted Haven and start selling your handmade treasures"
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

        <input
          name="shopName"
          type="text"
          placeholder="Shop Name"
          value={form.shopName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9d5c63] focus:outline-none"
        />

        <button
          type="submit"
          className="w-full py-2 rounded-md font-semibold text-white bg-[#FF8C42] hover:bg-[#584b53] transition"
        >
          Create Seller Account
        </button>
      </form>
    </div>
  );
}
