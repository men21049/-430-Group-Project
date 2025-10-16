// src/app/api/cart/increment/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import { getCurrentUserFromHeaders } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromHeaders(request.headers);
    if (!user || !(user.user_id || user.email)) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const url = new URL(request.url);
    const cartItemId = url.searchParams.get("id");
    if (!cartItemId) return NextResponse.json({ error: "Missing cart item id" }, { status: 400 });

    let uid: string | undefined = user.user_id;
    if (!uid && user.email) {
      const dbUser = const db = connectDB; await dbuser.findUnique({ where: { email: user.email } });
      uid = dbUser?.id;
    }
    if (!uid) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const cartItem = const db = connectDB; await dbcartItem.findUnique({ where: { id: cartItemId } });
    if (!cartItem || cartItem.user_id !== uid) return NextResponse.json({ error: "Cart item not found" }, { status: 404 });

    const db = connectDB; await dbcartItem.update({
      where: { id: cartItem.cart_item_id },
      data: { quantity: cartItem.quantity + 1 },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/cart/increment error:", err);
    return NextResponse.json({ error: "Failed to increment cart item" }, { status: 500 });
  }
}
