// src/app/api/cart/decrement/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import { getCurrentUserFromHeaders } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromHeaders(request.headers);
    if (!user || !(user.userId || user.email)) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const url = new URL(request.url);
    const cartItemId = url.searchParams.get("id");
    if (!cartItemId) return NextResponse.json({ error: "Missing cart item id" }, { status: 400 });

    let uid: string | undefined = user.userId;
    if (!uid && user.email) {
      const db = connectDB;
      const dbUsers = await db`SELECT user_id FROM users WHERE email = ${user.email}`;
      uid = dbUsers.length > 0 ? dbUsers[0].user_id : undefined;
    }
    if (!uid) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const db = connectDB;
    const cartItems = await db`SELECT * FROM cart_items WHERE cart_item_id = ${cartItemId}`;
    if (cartItems.length === 0 || cartItems[0].user_id !== uid) return NextResponse.json({ error: "Cart item not found" }, { status: 404 });

    const cartItem = cartItems[0];
    await db`
      UPDATE cart_items 
      SET quantity = ${Math.max(1, cartItem.quantity - 1)}, update_dt = NOW()
      WHERE cart_item_id = ${cartItemId}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/cart/decrement error:", err);
    return NextResponse.json({ error: "Failed to decrement cart item" }, { status: 500 });
  }
}
