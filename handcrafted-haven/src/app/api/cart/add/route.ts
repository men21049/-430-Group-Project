import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import { getCurrentUserFromHeaders, CurrentUserPayload } from "@/lib/auth";

interface AddCartBody {
  product_id: string;
  quantity?: number;
}

export async function POST(request: Request) {
  try {
    // Parse user from headers/cookies
    const user: CurrentUserPayload | null = getCurrentUserFromHeaders(request.headers);
    if (!user || !(user.user_id || user.email)) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse body safely
    let body: AddCartBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const product_id = body?.product_id?.trim() ?? "";
    const quantity = Math.max(1, Number(body?.quantity || 1));

    if (!product_id) {
      return NextResponse.json({ error: "Missing product_id in request body" }, { status: 400 });
    }

    const db = connectDB;

    // Resolve user_id from payload or email lookup
    let uid = user.user_id;
    if (!uid && user.email) {
      const dbUsers = await db`SELECT * FROM users WHERE email = ${user.email}`;
      uid = dbUsers.length > 0 ? dbUsers[0].user_id : undefined;
    }
    if (!uid) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify product exists
    const products = await db`SELECT * FROM products WHERE user_id = ${product_id}`;
    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const product = products[0];

    // Upsert cart item
    const existing = await db`
      SELECT * FROM cart_items 
      WHERE user_id = ${uid} AND product_id = ${product_id}
    `;

    let cartItem;
    if (existing.length > 0) {
      const updated = await db`
        UPDATE cart_items 
        SET quantity = ${existing[0].quantity + quantity}, update_dt = NOW()
        WHERE user_id = ${existing[0].id}
        RETURNING *
      `;
      cartItem = updated[0];
    } else {
      const newItem = await db`
        INSERT INTO cart_items (user_id, product_id, quantity, insert_dt, update_dt)
        VALUES (${uid}, ${product_id}, ${quantity}, NOW(), NOW())
        RETURNING *
      `;
      cartItem = newItem[0];
    }

    return NextResponse.json(
      {
        ok: true,
        item: {
          id: cartItem.id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          name: product.product_name,
          price: product.price,
          image: product.image_path ?? null,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/cart/add error:", err);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}
