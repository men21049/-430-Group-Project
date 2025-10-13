// src/app/lib/data.ts
// @ts-nocheck

import { Product } from "./definitions";
// Import Prisma client (relative path from src/app/lib -> src/prisma/client)
import prisma from "../../prisma/client";

/*
  Static demo data (kept for fallback and local/dev usage)
*/
const allSellers = [
  { id: "seller1", name: "Alice’s Art", logo: "/sellers/alice-logo.png", banner: "/sellers/alice-banner.jpg", bio: "Alice creates beautiful art pieces." },
  { id: "seller2", name: "Bob’s Crafts", logo: "/sellers/bob-logo.png", banner: "/sellers/bob-banner.jpg", bio: "Bob crafts unique handmade items." },
  // Add more sellers as needed
];

// Helper to get seller name by ID
export function getSellerName(sellerId: string) {
  return allSellers.find(s => s.id === sellerId)?.name || "Unknown Seller";
}

// Get full seller info
export async function getSellerInfo(sellerId: string) {
  return allSellers.find(s => s.id === sellerId) || { name: "Unknown Seller", logo: "", banner: "", bio: "" };
}

// Global product list (static fallback)
const allProducts: Product[] = [
  {
    id: "1",
    name: "Handmade Necklace",
    price: 25,
    image: "/products/necklace.jpg",
    sellerId: "seller1",
    category: "Jewellery",
    description: "Beautiful handcrafted necklace."
  },
  {
    id: "2",
    name: "Wooden Bowl",
    price: 40,
    image: "/products/bowl.jpg",
    sellerId: "seller2",
    category: "Home",
    description: "Hand-carved wooden bowl."
  },
  {
    id: "3",
    name: "Painted Canvas",
    price: 100,
    image: "/products/canvas.jpg",
    sellerId: "seller1",
    category: "Art",
    description: "Original painted canvas."
  },
  // Add more products as needed
];

/**
 * Backwards-compatible function expected by other modules.
 * Uses Prisma when DATABASE_URL is present and Prisma can be used; falls back to static data otherwise.
 *
 * @param sellerId optional seller id to filter products
 */
export async function getAllSellerProducts(sellerId?: string) {
  // Try using Prisma if a DATABASE_URL is provided (prevents accidental DB calls in build time when not configured)
  try {
    if (process.env.DATABASE_URL) {
      if (sellerId && sellerId.length > 0) {
        return await prisma.product.findMany({
          where: { sellerId },
          orderBy: { createdAt: "desc" },
        });
      }
      return await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (err) {
    // If Prisma query fails (e.g., no DB during build), fall back to static data.
    // eslint-disable-next-line no-console
    console.warn("Prisma query failed in getAllSellerProducts — falling back to static products", err);
  }

  // Static fallback
  if (typeof sellerId === "string" && sellerId.length > 0) {
    return allProducts.filter(p => p.sellerId === sellerId);
  }
  return allProducts;
}

/**
 * Keep getSellerProducts available (existing code may import this name).
 * Delegates to getAllSellerProducts for single-source behavior.
 */
export async function getSellerProducts(sellerId?: string) {
  return getAllSellerProducts(sellerId);
}

/**
 * Search globally by name or category (static implementation — you can later add a Prisma-backed version)
 */
export async function searchProducts(query: string) {
  const q = query.toLowerCase();
  return allProducts.filter(
    p => p.name.toLowerCase().includes(q) || (p.category?.toLowerCase().includes(q))
  );
}

/**
 * Optional: fetch fake products from external API (kept as-is)
 */
export async function getFakeProducts() {
  try {
    const res = await fetch("https://fakestoreapi.com/products");
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const data: Product[] = await res.json();
    return data; // returns all API products
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data");
  }
}
