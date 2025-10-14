// src/app/utils/auth.ts
import prisma from "@/prisma/client";

export async function getCurrentUser() {
  // Here, replace this with your actual authentication logic
  // Example: using cookies, session, or NextAuth
  // For demo purposes, returning a mock user
  return {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    role: "SELLER", // or "CUSTOMER" / "ADMIN"
  };
}
