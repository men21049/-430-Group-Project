import { NextResponse } from "next/server";
import prisma from "@/prisma/client";

// GET /api/orders?customerId=optional
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const qCustomer = url.searchParams.get("customerId");

    // get userId from cookie if not provided in query
    const cookie = req.headers.get("cookie") || "";
    const cookieMatch = cookie.match(/userId=([^;]+)/);
    const customerId = qCustomer ?? cookieMatch?.[1];

    if (!customerId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, price: true, image: true, sellerId: true } },
          },
        },
      },
    });

    const out = orders.map((o) => ({
      id: o.id,
      createdAt: o.createdAt,
      total: o.total,
      status: o.status,
      items: o.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.product?.name ?? "Unknown",
        quantity: it.quantity,
        price: it.price,
        sellerId: it.product?.sellerId ?? null,
      })),
    }));

    return NextResponse.json(out);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: { id: string; quantity: number }[] = body.items ?? [];

    // get customerId from body or cookie
    const cookie = req.headers.get("cookie") || "";
    const cookieMatch = cookie.match(/userId=([^;]+)/);
    const customerId = body.customerId ?? cookieMatch?.[1];

    if (!customerId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Build order items and compute total
    const orderItemsData: { productId: string; quantity: number; price: number }[] = [];
    let total = 0;

    for (const it of items) {
      const product = await prisma.product.findUnique({ where: { id: it.id } });
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${it.id}` }, { status: 400 });
      }
      const price = product.price;
      const qty = Math.max(1, Math.floor(it.quantity || 1));
      total += price * qty;
      orderItemsData.push({ productId: product.id, quantity: qty, price });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        customer: { connect: { id: customerId } },
        total,
        status: "COMPLETED",
        items: {
          create: orderItemsData.map((oi) => ({
            product: { connect: { id: oi.productId } },
            quantity: oi.quantity,
            price: oi.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json({ ok: true, orderId: order.id, order }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create order" }, { status: 500 });
  }
}
