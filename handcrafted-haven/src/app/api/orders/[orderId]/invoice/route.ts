// src/app/api/orders/[orderId]/invoice/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function GET(
  req: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    // Await the params to get the orderId
    const { orderId } = await context.params;

    // Fetch order with customer info and items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { user: { select: { name: true, email: true } } } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Build invoice content
    const customerName = order.customer.user?.name ?? "Customer";
    const customerEmail = order.customer.user?.email ?? "";
    let content = `HANDCRAFTED HAVEN INVOICE\n`;
    content += `Order ID: ${order.id}\n`;
    content += `Date: ${order.createdAt.toISOString()}\n\n`;
    content += `Bill To: ${customerName}\n`;
    if (customerEmail) content += `${customerEmail}\n`;
    content += `\nItems:\n`;

    order.items.forEach((it, index) => {
      const name = it.product?.name ?? "Item";
      const qty = it.quantity;
      const unit = it.price.toFixed(2);
      const line = (it.price * it.quantity).toFixed(2);
      content += `${index + 1}. ${name} x${qty} @ $${unit} = $${line}\n`;
    });

    content += `\nTOTAL: $${order.total.toFixed(2)}\n`;
    content += `\nThank you for your purchase!\n`;

    // Convert to Uint8Array
    const encoder = new TextEncoder();
    const buffer = encoder.encode(content);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename=invoice-${order.id}.txt`,
      },
    });
  } catch (err) {
    console.error("GET invoice error:", err);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
