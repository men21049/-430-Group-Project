// src/app/api/cart/clear/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getCurrentUserFromHeaders } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromHeaders(request.headers);
    if (!user || !(user.userId || user.email)) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let uid: string | undefined = user.userId;
    if (!uid && user.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
      uid = dbUser?.id;
    }

    if (!uid) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await prisma.cartItem.deleteMany({ where: { userId: uid } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("POST /api/cart/clear error:", err);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
