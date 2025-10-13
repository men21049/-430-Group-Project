import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  // await the params promise
  const { orderId } = await context.params;

  try {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/userId=([^;]+)/);
    const userId = match?.[1];

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

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

    let allowed = false;
    if (order.customer.userId === userId) allowed = true;

    const sellerIds = new Set(
      order.items.map((it) => it.product?.sellerId).filter(Boolean) as string[]
    );
    if (sellerIds.has(userId)) allowed = true;

    const maybeUser = await prisma.user.findUnique({ where: { id: userId } });
    if (maybeUser?.role === "ADMIN") allowed = true;

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
