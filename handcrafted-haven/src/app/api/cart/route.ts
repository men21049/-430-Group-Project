// src/app/api/cart/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import { getCurrentUserFromHeaders } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromHeaders(request.headers);
    if (!user || !(user.user_id || user.email)) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = connectDB;
    let uid: string | undefined = user.user_id;
    if (!uid && user.email) {
      const dbUsers = await db`SELECT * FROM users WHERE email = ${user.email}`;
      uid = dbUsers.length > 0 ? dbUsers[0].user_id : undefined;
    }
    if (!uid) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const cartItems = await db`
      SELECT ci.*, p.product_name as name, p.price, p.image_path as image
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.product_id
      WHERE ci.user_id = ${uid}
    `;

    const items = cartItems.map(ci => ({
      id: ci.id,
      product_id: ci.product_id,
      name: ci.name ?? "Unknown product",
      price: ci.price ?? 0,
      quantity: ci.quantity,
      image: ci.image ?? null,
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET /api/cart error:", err);
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}
