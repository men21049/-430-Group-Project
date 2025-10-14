// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getCurrentUserFromHeaders } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromHeaders(request.headers);
    if (!user?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const uid = user.userId;
    const role = (user.role || "CUSTOMER").toUpperCase();

    const allowedRoles = ["CUSTOMER", "SELLER", "ADMIN"];
    if (!allowedRoles.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let customer = await prisma.customer.findUnique({ where: { userId: uid } });
    if (!customer) customer = await prisma.customer.create({ data: { userId: uid } });
    const customerId = customer.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: uid },
      include: { product: true },
    });

    if (!cartItems.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const missingProducts: string[] = [];
    for (const ci of cartItems) {
      if (!ci.product) missingProducts.push(ci.productId);
    }
    if (missingProducts.length) return NextResponse.json({ error: "Some products not found", missingProducts }, { status: 400 });

    let total = 0;
    const orderItemsData = cartItems.map(ci => {
      const price = ci.product?.price ?? 0;
      total += price * ci.quantity;
      return { productId: ci.productId, quantity: ci.quantity, price };
    });

    // Unlimited stock: remove decrement logic
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerId,
          total,
          status: "PENDING",
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { userId: uid } });
      return order;
    });

    return NextResponse.json({ orderId: createdOrder.id }, { status: 200 });

  } catch (err) {
    console.error("POST /api/checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
