import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import { getCurrentUserFromHeaders, CurrentUserPayload } from "@/lib/auth";

interface AddCartBody {
  productId: string;
  quantity?: number;
}

export async function POST(request: Request) {
  try {
    // Parse user from headers/cookies
    const user: CurrentUserPayload | null = getCurrentUserFromHeaders(request.headers);
    if (!user || !(user.userId || user.email)) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse body safely
    let body: AddCartBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const productId = body?.productId?.trim() ?? "";
    const quantity = Math.max(1, Number(body?.quantity || 1));

    if (!productId) {
      return NextResponse.json({ error: "Missing productId in request body" }, { status: 400 });
    }

    // Resolve userId from payload or email lookup
    let uid = user.userId;
    if (!uid && user.email) {
      const db = connectDB;
      const dbUsers = await db`SELECT user_id FROM users WHERE email = ${user.email}`;
      uid = dbUsers.length > 0 ? dbUsers[0].user_id : undefined;
    }
    if (!uid) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify product exists
    const db = connectDB;
    const products = await db`SELECT * FROM products WHERE product_id = ${productId}`;
    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const product = products[0];

    // Upsert cart item
    const existingItems = await db`
      SELECT * FROM cart_items 
      WHERE user_id = ${uid} AND product_id = ${productId}
    `;

    let cartItem;
    if (existingItems.length > 0) {
      const existing = existingItems[0];
      const updatedItems = await db`
        UPDATE cart_items 
        SET quantity = ${existing.quantity + quantity}, update_dt = NOW()
        WHERE cart_item_id = ${existing.cart_item_id}
        RETURNING *
      `;
      cartItem = updatedItems[0];
    } else {
      const newItems = await db`
        INSERT INTO cart_items (user_id, product_id, quantity, insert_dt, update_dt)
        VALUES (${uid}, ${productId}, ${quantity}, NOW(), NOW())
        RETURNING *
      `;
      cartItem = newItems[0];
    }

    return NextResponse.json(
      {
        ok: true,
        item: {
          id: cartItem.cart_item_id,
          productId: cartItem.product_id,
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
