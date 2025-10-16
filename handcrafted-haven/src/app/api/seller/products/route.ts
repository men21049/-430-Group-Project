// src/app/api/seller/products/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import {
  getCurrentUserFromRequest,
  isSellerOrAdmin,
  isAdmin,
} from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = connectDB;

    // Admin can fetch all products
    if (isAdmin(user)) {
      const allProducts = await db`
        SELECT 
          p.product_id as id, 
          p.product_name as name, 
          p.price, 
          p.cost,
          p.stock,
          p.description,
          p.category, 
          p.image_path as image, 
          p.seller_id, 
          p.insert_dt as created_at, 
          p.isactive,
          s.seller_name
        FROM products p
        LEFT JOIN sellers s ON p.seller_id = s.seller_id
        WHERE p.isactive = true
        ORDER BY p.insert_dt DESC
      `;
      return NextResponse.json(allProducts);
    }

    // Seller: fetch products belonging to their seller profile
    if (!isSellerOrAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find seller profile associated with the user
    // First try to find by user_id (new preferred method)
    let sellers = await db`
      SELECT seller_id, seller_name FROM sellers 
      WHERE user_id = ${user.userId}
    `;
    
    // Fallback to name matching if no direct user_id link
    if (sellers.length === 0 && user.name) {
      const firstName = user.name.split(' ')[0] || '';
      const lastName = user.name.split(' ')[1] || '';
      sellers = await db`
        SELECT seller_id, seller_name FROM sellers 
        WHERE seller_name LIKE ${`%${user.name}%`}
           OR seller_name LIKE ${`%${firstName}%`}
           OR seller_name LIKE ${`%${lastName}%`}
      `;
    }
    
    if (sellers.length === 0) {
      return NextResponse.json({ 
        error: "No seller profile found for this user. Please contact support to link your account to a seller profile." 
      }, { status: 404 });
    }
    
    const seller = sellers[0];

    const products = await db`
      SELECT 
        product_id as id, 
        product_name as name, 
        price, 
        cost,
        stock,
        description, 
        category, 
        image_path as image, 
        seller_id, 
        insert_dt as created_at, 
        isactive
      FROM products
      WHERE seller_id = ${seller.seller_id} 
      AND isactive = true
      ORDER BY insert_dt DESC
    `;

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /api/seller/products error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!isSellerOrAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, price, category, image, description, cost, stock } = body;
    let { sellerId: explicitSellerId } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = connectDB;
    let targetSellerId: number | null = null;

    if (isAdmin(user) && explicitSellerId) {
      const s = await db`SELECT seller_id FROM sellers WHERE seller_id = ${explicitSellerId}`;
      if (s.length === 0) return NextResponse.json({ error: "Specified seller not found" }, { status: 404 });
      targetSellerId = s[0].seller_id;
    } else {
      const sellers = await db`SELECT seller_id FROM sellers WHERE seller_name LIKE ${`%${user.name}%`}`;
      if (sellers.length === 0) return NextResponse.json({ error: "No seller profile found for this user" }, { status: 404 });
      targetSellerId = sellers[0].seller_id;
    }

    const newProduct = await db`
      INSERT INTO products (
        product_name, price, cost, stock, description, category, image_path, 
        seller_id, isactive, insert_dt, update_dt
      )
      VALUES (
        ${name}, ${parseFloat(String(price))}, ${parseFloat(String(cost || 0))}, 
        ${parseInt(String(stock || 0))}, ${description || ''}, 
        ${category || null}, ${image || null}, ${targetSellerId}, 
        true, NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json(newProduct[0]);
  } catch (err) {
    console.error("POST /api/seller/products error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!isSellerOrAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });

    const db = connectDB;
    const products = await db`SELECT seller_id FROM products WHERE product_id = ${id}`;
    if (products.length === 0) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const product = products[0];

    if (!isAdmin(user)) {
      // First try to find by user_id (new preferred method)
      let sellers = await db`SELECT seller_id FROM sellers WHERE user_id = ${user.userId}`;
      
      // Fallback to name matching if no direct user_id link
      if (sellers.length === 0 && user.name) {
        sellers = await db`SELECT seller_id FROM sellers WHERE seller_name LIKE ${`%${user.name}%`}`;
      }
      
      if (sellers.length === 0 || product.seller_id !== sellers[0].seller_id) {
        return NextResponse.json({ error: "Product not owned by you" }, { status: 403 });
      }
    }

    await db`
      UPDATE products 
      SET isactive = false, update_dt = NOW() 
      WHERE product_id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/seller/products error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}