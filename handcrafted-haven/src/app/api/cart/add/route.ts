// src/app/api/cart/add/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getCurrentUserFromHeaders } from "@/lib/auth";

/**
 * POST /api/cart/add
 * body: { productId: string, quantity?: number }
 *
 * Returns 200 with created/updated cart item shape, or a descriptive JSON error.
 */
export async function POST(request: Request) {
  try {
    // parse user from headers/cookies
    const user = getCurrentUserFromHeaders(request.headers as any);
    if (!user || !(user.userId || user.email)) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // parse body safely
    let body: any = null;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const productId = typeof body?.productId === "string" ? body.productId.trim() : "";
    const quantity = Math.max(1, Number(body?.quantity || 1));

    if (!productId) {
      return NextResponse.json({ error: "Missing productId in request body" }, { status: 400 });
    }

    // resolve userId from payload or email lookup
    let uid = user.userId;
    if (!uid && user.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
      uid = dbUser?.id;
    }
    if (!uid) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // upsert cart item
    const existing = await prisma.cartItem.findFirst({
      where: { userId: uid, productId },
    });

    let cartItem;
    if (existing) {
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: uid,
          productId,
          quantity,
        },
      });
    }

    return NextResponse.json(
      {
        ok: true,
        item: {
          id: cartItem.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          name: product.name,
          price: product.price,
          image: product.image ?? null,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/cart/add error:", err);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}
