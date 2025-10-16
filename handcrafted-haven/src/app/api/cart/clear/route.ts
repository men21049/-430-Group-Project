// src/app/api/cart/clear/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import { getCurrentUserFromHeaders } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromHeaders(request.headers);
    if (!user || !(user.userId || user.email)) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let uid: string | undefined = user.userId;
    if (!uid && user.email) {
      const db = connectDB;
      const dbUsers = await db`SELECT user_id FROM users WHERE email = ${user.email}`;
      uid = dbUsers.length > 0 ? dbUsers[0].user_id : undefined;
    }

    if (!uid) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const db = connectDB;
    await db`DELETE FROM cart_items WHERE user_id = ${uid}`;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("POST /api/cart/clear error:", err);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
