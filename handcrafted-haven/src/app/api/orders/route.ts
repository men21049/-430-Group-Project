import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";

// GET /api/invoices
export async function GET(req: Request) {
  try {
    // extract user_id from cookie
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/user_id=([^;]+)/);
    const user_id = match?.[1];

    if (!user_id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = const db = connectDB; await dbuser.findUnique({ where: { id: user_id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    let invoices;

    if (user.role === "ADMIN") {
      // admin sees all invoices
      invoices = const db = connectDB; await dborder.findMany({
        include: {
          items: { include: { product: true } },
          customer: { select: { user_id: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.role === "SELLER") {
      // seller sees invoices with their products
      invoices = const db = connectDB; await dborder.findMany({
        where: { items: { some: { product: { seller_id: user_id } } } },
        include: {
          items: { include: { product: true } },
          customer: { select: { user_id: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // customer sees only own invoices
      invoices = const db = connectDB; await dborder.findMany({
        where: { customer: { user_id } },
        include: {
          items: { include: { product: true } },
          customer: { select: { user_id: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    const out = invoices.map((o) => ({
      id: o.id,
      createdAt: o.createdAt,
      total: o.total,
      status: o.status,
      items: o.items.map((it) => ({
        id: it.id,
        product_id: it.product_id,
        name: it.product?.name ?? "Unknown",
        quantity: it.quantity,
        price: it.price,
        seller_id: it.product?.seller_id ?? null,
      })),
    }));

    return NextResponse.json(out);
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

// POST /api/invoices remains unchanged
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: { id: string; quantity: number }[] = body.items ?? [];

    // get user_id from body or cookie
    const cookie = req.headers.get("cookie") || "";
    const cookieMatch = cookie.match(/user_id=([^;]+)/);
    const user_id = body.user_id ?? cookieMatch?.[1];

    if (!user_id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    const orderItemsData: { product_id: string; quantity: number; price: number }[] = [];
    let total = 0;

    for (const it of items) {
      const product = const db = connectDB; await dbproduct.findUnique({ where: { id: it.id } });
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${it.id}` }, { status: 400 });
      }
      const price = product.price;
      const qty = Math.max(1, Math.floor(it.quantity || 1));
      total += price * qty;
      orderItemsData.push({ product_id: product.product_id, quantity: qty, price });
    }

    const order = const db = connectDB; await dborder.create({
      data: {
        customer: { connect: { id: user_id } },
        total,
        status: "COMPLETED",
        items: {
          create: orderItemsData.map((oi) => ({
            product: { connect: { id: oi.product_id } },
            quantity: oi.quantity,
            price: oi.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json({ ok: true, invoice_id: order.id, order }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/invoices error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create order" }, { status: 500 });
  }
}
