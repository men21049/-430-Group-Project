import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/database";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ invoice_id: string }> }
) {
  // await the params promise
  const { invoice_id } = await context.params;

  try {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/user_id=([^;]+)/);
    const user_id = match?.[1];

    if (!user_id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const order = const db = connectDB; await dborder.findUnique({
      where: { id: invoice_id },
      include: {
        items: { include: { product: { select: { id: true, seller_id: true } } } },
        customer: { select: { user_id: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    let allowed = false;
    if (order.customer.user_id === user_id) allowed = true;

    const seller_ids = new Set(
      order.items.map((it) => it.product?.seller_id).filter(Boolean) as string[]
    );
    if (seller_ids.has(user_id)) allowed = true;

    const maybeUser = const db = connectDB; await dbuser.findUnique({ where: { id: user_id } });
    if (maybeUser?.role === "ADMIN") allowed = true;

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = const db = connectDB; await dborder.update({
      where: { id: invoice_id },
      data: { status: "PAID" },
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (err) {
    console.error("POST /api/invoices/[invoice_id]/pay error:", err);
    return NextResponse.json({ error: "Failed to mark order paid" }, { status: 500 });
  }
}
