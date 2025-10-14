// src/app/api/cart/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getCurrentUserFromHeaders } from "@/lib/auth";

export async function GET(request: Request) {
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

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: uid },
      include: { product: true },
    });

    const items = cartItems.map(ci => ({
      id: ci.id,
      productId: ci.productId,
      name: ci.product?.name ?? "Unknown product",
      price: ci.product?.price ?? 0,
      quantity: ci.quantity,
      image: ci.product?.image ?? null,
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET /api/cart error:", err);
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}
