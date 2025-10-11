import { NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function GET(req: Request, { params }: { params: { orderId: string } }) {
  const { orderId } = params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { id: true, name: true, price: true } } } },
        customer: { select: { user: { select: { name: true, email: true } } } },
      },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const out = {
      id: order.id,
      createdAt: order.createdAt,
      total: order.total,
      status: order.status,
      customer: {
        name: order.customer.user?.name ?? "Customer",
        email: order.customer.user?.email ?? "",
      },
      items: order.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.product?.name ?? "Unknown",
        quantity: it.quantity,
        price: it.price,
      })),
    };

    return NextResponse.json(out);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
