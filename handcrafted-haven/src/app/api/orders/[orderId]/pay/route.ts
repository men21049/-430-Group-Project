// handcrafted-haven/src/app/api/orders/[orderId]/pay/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;

  try {
    // extract userId from cookie
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/userId=([^;]+)/);
    const userId = match?.[1];

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // fetch order with customer and items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { id: true, sellerId: true } } } },
        customer: { select: { userId: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // permission check
    let allowed = false;

    // customer can mark their own order paid
    if (order.customer.userId === userId) allowed = true;

    // any seller of a product in the order
    const sellerIds = new Set(order.items.map((it) => it.product?.sellerId).filter(Boolean) as string[]);
    if (sellerIds.has(userId)) allowed = true;

    // admin check
    const maybeUser = await prisma.user.findUnique({ where: { id: userId } });
    if (maybeUser?.role === "ADMIN") allowed = true;

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // update order status to PAID
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (err) {
    console.error("POST /api/orders/[orderId]/pay error:", err);
    return NextResponse.json({ error: "Failed to mark order paid" }, { status: 500 });
  }
}
