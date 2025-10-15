// src/app/lib/data.ts
// @ts-nocheck

import { Product, Category } from "./definitions";
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
        const products = await db`
            SELECT 
                product_id as id,
                product_name as name,
                price,
                description,
                category,
                image_path as image,
                seller_id,
                insert_dt as created_at
            FROM products 
            WHERE isactive = true
        `;
        console.log("✅ Productos obtenidos de la base de datos:", products.length);
        return products;
    } catch (error) {
        console.error("❌ Error fetching data from database:", error);
        
        // Si es un error de conexión, devolver datos de ejemplo
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.log("⚠️ Usando datos de ejemplo debido a error de conexión");
            return [];
        }
        
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
        const products = await db`
            SELECT 
                product_id as id,
                product_name as name,
                price,
                description,
                category,
                image_path as image,
                seller_id,
                insert_dt as created_at
            FROM products 
            WHERE product_id = ${id} AND isactive = true
        `;
        
        if (products.length === 0) {
            throw new Error(`Product with ID ${id} not found`);
        }
        
        return products[0]; // Retornar el primer (y único) producto
    }
    catch (error) {
        console.error("❌ Error fetching product from database:", error);
        
        // Si es un error de conexión, devolver null
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.log("⚠️ Error de conexión, devolviendo null");
            return null;
        }
        
        throw new Error("Failed to fetch product from database");
    }
}

export async function getCategoriesFromDB() {
    try {
        const db = connectDB;
        const categories = await db`
            SELECT DISTINCT category 
            FROM products 
            WHERE isactive = true AND category IS NOT NULL
        `;
        return categories;
    } catch (error) {
        console.error("❌ Error fetching categories from database:", error);
        
        // Si es un error de conexión, devolver categorías de ejemplo
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.log("⚠️ Usando categorías de ejemplo debido a error de conexión");
            return [];
        }
        
        throw new Error("Failed to fetch categories from database");
    }
}
