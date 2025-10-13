import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
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
      const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
      uid = dbUser?.id;
    }
    if (!uid) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Upsert cart item
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
