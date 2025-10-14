// src/app/api/cart/decrement/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
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
      const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
      uid = dbUser?.id;
    }
    if (!uid) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
    if (!cartItem || cartItem.userId !== uid) return NextResponse.json({ error: "Cart item not found" }, { status: 404 });

    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: Math.max(1, cartItem.quantity - 1) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/cart/decrement error:", err);
    return NextResponse.json({ error: "Failed to decrement cart item" }, { status: 500 });
  }
}
