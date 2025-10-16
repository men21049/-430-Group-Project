// src/app/api/seller/products/[id]/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import {
  getCurrentUserFromRequest,
  isSellerOrAdmin,
  isAdmin,
} from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!isSellerOrAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: productId } = await params;
    const db = connectDB;

    // Check if product exists and belongs to seller
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
        isactive,
        insert_dt as created_at
      FROM products 
      WHERE product_id = ${productId}
    `;

    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = products[0];

    // Check ownership (unless admin)
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

    return NextResponse.json(product);
  } catch (err) {
    console.error("GET /api/seller/products/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { id: productId } = await params;

    if (!name || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = connectDB;

    // Check if product exists and belongs to seller
    const existingProducts = await db`SELECT seller_id FROM products WHERE product_id = ${productId}`;
    if (existingProducts.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!isAdmin(user)) {
      // First try to find by user_id (new preferred method)
      let sellers = await db`SELECT seller_id FROM sellers WHERE user_id = ${user.userId}`;
      
      // Fallback to name matching if no direct user_id link
      if (sellers.length === 0 && user.name) {
        sellers = await db`SELECT seller_id FROM sellers WHERE seller_name LIKE ${`%${user.name}%`}`;
      }
      
      if (sellers.length === 0 || existingProducts[0].seller_id !== sellers[0].seller_id) {
        return NextResponse.json({ error: "Product not owned by you" }, { status: 403 });
      }
    }

    // Update product
    const updatedProduct = await db`
      UPDATE products 
      SET 
        product_name = ${name},
        price = ${parseFloat(String(price))},
        cost = ${parseFloat(String(cost || 0))},
        stock = ${parseInt(String(stock || 0))},
        description = ${description || ''},
        category = ${category || null},
        image_path = ${image || null},
        update_dt = NOW()
      WHERE product_id = ${productId}
      RETURNING *
    `;

    return NextResponse.json(updatedProduct[0]);
  } catch (err) {
    console.error("PUT /api/seller/products/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!isSellerOrAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id: productId } = await params;

    const db = connectDB;

    // Check if product exists and belongs to seller
    const existingProducts = await db`SELECT seller_id FROM products WHERE product_id = ${productId}`;
    if (existingProducts.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!isAdmin(user)) {
      // First try to find by user_id (new preferred method)
      let sellers = await db`SELECT seller_id FROM sellers WHERE user_id = ${user.userId}`;
      
      // Fallback to name matching if no direct user_id link
      if (sellers.length === 0 && user.name) {
        sellers = await db`SELECT seller_id FROM sellers WHERE seller_name LIKE ${`%${user.name}%`}`;
      }
      
      if (sellers.length === 0 || existingProducts[0].seller_id !== sellers[0].seller_id) {
        return NextResponse.json({ error: "Product not owned by you" }, { status: 403 });
      }
    }

    // Build dynamic update query based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (body.name !== undefined) {
      updateFields.push(`product_name = $${updateFields.length + 1}`);
      updateValues.push(body.name);
    }
    if (body.price !== undefined) {
      updateFields.push(`price = $${updateFields.length + 1}`);
      updateValues.push(parseFloat(String(body.price)));
    }
    if (body.cost !== undefined) {
      updateFields.push(`cost = $${updateFields.length + 1}`);
      updateValues.push(parseFloat(String(body.cost)));
    }
    if (body.stock !== undefined) {
      updateFields.push(`stock = $${updateFields.length + 1}`);
      updateValues.push(parseInt(String(body.stock)));
    }
    if (body.description !== undefined) {
      updateFields.push(`description = $${updateFields.length + 1}`);
      updateValues.push(body.description);
    }
    if (body.category !== undefined) {
      updateFields.push(`category = $${updateFields.length + 1}`);
      updateValues.push(body.category);
    }
    if (body.image !== undefined) {
      updateFields.push(`image_path = $${updateFields.length + 1}`);
      updateValues.push(body.image);
    }
    if (body.isactive !== undefined) {
      updateFields.push(`isactive = $${updateFields.length + 1}`);
      updateValues.push(body.isactive);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updateFields.push("update_dt = NOW()");
    updateValues.push(productId);

    const query = `
      UPDATE products 
      SET ${updateFields.join(", ")}
      WHERE product_id = $${updateValues.length}
      RETURNING *
    `;

    const updatedProduct = await db.unsafe(query, updateValues);

    return NextResponse.json(updatedProduct[0]);
  } catch (err) {
    console.error("PATCH /api/seller/products/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}