// src/app/api/cart/clear/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import { getCurrentUserFromHeaders } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromHeaders(request.headers);
    if (!user || !(user.user_id || user.email)) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let uid: string | undefined = user.user_id;
    if (!uid && user.email) {
      const dbUser = const db = connectDB; await dbuser.findUnique({ where: { email: user.email } });
      uid = dbUser?.id;
    }

    if (!uid) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const db = connectDB; await dbcartItem.deleteMany({ where: { user_id: uid } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("POST /api/cart/clear error:", err);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
