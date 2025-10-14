// src/app/lib/data.ts
// @ts-nocheck

import { Product,Category } from "./definitions";
import connectDB from "./database";

export function getSellerName(sellerId: string) {
  return allSellers.find(s => s.id === sellerId)?.name || "Unknown Seller";
}

// Get full seller info
export async function getSellerInfo(sellerId: string) {
  return allSellers.find(s => s.id === sellerId) || { name: "Unknown Seller", logo: "", banner: "", bio: "" };
}

export async function getAllSellerProducts(sellerId?: string) {
  
  const allProducts = await getProductsFromDB();
  return allProducts;
}

export async function getSellerProducts(sellerId?: string) {
  return getAllSellerProducts(sellerId);
}

/**
 * Search globally by name or category (static implementation — you can later add a Prisma-backed version)
 */
export async function searchProducts(query: string) {
  const q = query.toLowerCase();
  return allProducts.filter(
    p => p.name.toLowerCase().includes(q) || (p.category?.map(c => c.toLowerCase()).includes(q) || p.description?.toLowerCase().includes(q)) //this works with category array and description.
  );
}


export async function getProductsFromDB() {
    try {
        const db = connectDB;
        const products = await db<Product[]>`SELECT * FROM products;`;
        console.log(products);
        return products;
    } catch (error) {
        console.error("Error fetching data from database:", error);
        throw new Error("Failed to fetch data from database");
    }
}

export async function getProductFromDB(productId: string | number) {
    try {
        // Convertir a número si es string
        const id = typeof productId === 'string' ? parseInt(productId, 10) : productId;
        
        // Validar que el ID sea un número válido
        if (isNaN(id) || id <= 0) {
            throw new Error(`Invalid product ID: ${productId}`);
        }
        
        const db = connectDB;
        const products = await db<Product[]>`SELECT * FROM products WHERE product_id = ${id};`;
        
        if (products.length === 0) {
            throw new Error(`Product with ID ${id} not found`);
        }
        
        return products[0]; // Retornar el primer (y único) producto
    }
    catch (error) {
        console.error("Error fetching product from database:", error);
        throw new Error("Failed to fetch product from database");
    }
}

export async function getCategoriesFromDB() {
    try {
        const db = connectDB;
        const categories = await db<Category[]>`SELECT DISTINCT category FROM products;`;
        return categories;
    } catch (error) {
        console.error("Error fetching categories from database:", error);
        throw new Error("Failed to fetch categories from database");
    }
}
