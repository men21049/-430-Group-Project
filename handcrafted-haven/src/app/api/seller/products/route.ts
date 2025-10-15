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
    if (!user?.user_id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = connectDB;

    // Admin can fetch all products
    if (isAdmin(user)) {
      const allProducts = await db`
        SELECT 
          p.product_id,
          p.product_name,
          p.price,
          p.description,
          p.category,
          p.image_path,
          p.seller_id,
          p.insert_dt,
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

    // Find seller profile for this user
    const seller = await db`
      SELECT * FROM sellers 
      WHERE seller_name LIKE ${`%${user.name}%`} 
      OR seller_name LIKE ${`%${user.email.split('@')[0]}%`}
      LIMIT 1
    `;

    if (seller.length === 0) {
      return NextResponse.json({ error: "No seller profile found" }, { status: 404 });
    }

    const products = await db`
      SELECT 
        product_id,
        product_name,
        price,
        description,
        category,
        image_path,
        seller_id,
        insert_dt,
        isactive
      FROM products 
      WHERE seller_id = ${seller[0].seller_id} 
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
    if (!user?.user_id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Allow SELLER and ADMIN to create products
    if (!isSellerOrAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, price, category, image, seller_id: explicitSellerId } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const db = connectDB;

    // If admin provided explicit seller_id, use it; otherwise use seller associated with the user
    let targetSellerId: number | null = null;
    if (isAdmin(user) && explicitSellerId) {
      // ensure seller exists
      const seller = await db`
        SELECT seller_id FROM sellers WHERE seller_id = ${explicitSellerId}
      `;
      if (seller.length === 0) {
        return NextResponse.json({ error: "Specified seller not found" }, { status: 404 });
      }
      targetSellerId = seller[0].seller_id;
    } else {
      const seller = await db`
        SELECT seller_id FROM sellers 
        WHERE seller_name LIKE ${`%${user.name}%`} 
        OR seller_name LIKE ${`%${user.email.split('@')[0]}%`}
        LIMIT 1
      `;
      if (seller.length === 0) {
        return NextResponse.json({ error: "No seller profile found" }, { status: 404 });
      }
      targetSellerId = seller[0].seller_id;
    }

    const newProduct = await db`
      INSERT INTO products (
        product_name, 
        price, 
        description, 
        category, 
        image_path, 
        seller_id, 
        isactive, 
        insert_dt, 
        update_dt
      )
      VALUES (
        ${name}, 
        ${parseFloat(String(price))}, 
        ${body.description || ''}, 
        ${category || null}, 
        ${image || null}, 
        ${targetSellerId}, 
        true, 
        NOW(), 
        NOW()
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
    if (!user?.user_id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!isSellerOrAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });

    const db = connectDB;

    const product = await db`
      SELECT * FROM products WHERE product_id = ${id}
    `;
    
    if (product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // If not admin, ensure product belongs to seller
    if (!isAdmin(user)) {
      const seller = await db`
        SELECT seller_id FROM sellers 
        WHERE seller_name LIKE ${`%${user.name}%`} 
        OR seller_name LIKE ${`%${user.email.split('@')[0]}%`}
        LIMIT 1
      `;
      
      if (seller.length === 0 || product[0].seller_id !== seller[0].seller_id) {
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