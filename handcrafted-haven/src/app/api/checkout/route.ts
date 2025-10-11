// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getCurrentUserFromHeaders } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const user = getCurrentUserFromHeaders(request.headers);
    if (!user?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const uid = user.userId;
    const role = (user.role || "CUSTOMER").toUpperCase();

    // 2. Only allow these roles
    const allowedRoles = ["CUSTOMER", "SELLER", "ADMIN"];
    if (!allowedRoles.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 3. Resolve or create customer profile
    let customer = await prisma.customer.findUnique({ where: { userId: uid } });
    if (!customer) customer = await prisma.customer.create({ data: { userId: uid } });
    const customerId = customer.id;

    // 4. Fetch cart items with product info
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: uid },
      include: { product: true },
    });

    if (!cartItems.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    // 5. Validate products exist and stock
    const missingProducts: string[] = [];
    const outOfStock: { productId: string; available: number; requested: number }[] = [];

    for (const ci of cartItems) {
      const product = ci.product;
      if (!product) missingProducts.push(ci.productId);
      else if (typeof product.stock === "number" && product.stock < ci.quantity) {
        outOfStock.push({ productId: ci.productId, available: product.stock, requested: ci.quantity });
      }
    }

    if (missingProducts.length) return NextResponse.json({ error: "Some products not found", missingProducts }, { status: 400 });
    if (outOfStock.length) return NextResponse.json({ error: "Some products are out of stock", outOfStock }, { status: 400 });

    // 6. Prepare order items and total
    let total = 0;
    const orderItemsData = cartItems.map(ci => {
      const price = ci.product?.price ?? 0;
      total += price * ci.quantity;
      return { productId: ci.productId, quantity: ci.quantity, price };
    });

    // 7. Transaction: create order, decrement stock, clear cart
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

      for (const ci of cartItems) {
        const product = ci.product;
        if (!product || typeof product.stock !== "number") continue;
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: ci.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: uid } });

      return order;
    });

    return NextResponse.json({ orderId: createdOrder.id }, { status: 200 });

  } catch (err) {
    console.error("POST /api/checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
