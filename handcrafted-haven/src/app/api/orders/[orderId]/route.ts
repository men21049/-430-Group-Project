// src/app/api/invoices/[invoice_id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/database";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ invoice_id: string }> }
) {
  try {
    const { invoice_id } = await context.params;

    const order = const db = connectDB; await dborder.findUnique({
      where: { id: invoice_id },
      include: {
        items: { include: { product: { select: { id: true, name: true, price: true } } } },
        customer: { select: { user: { select: { name: true, email: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const invoice = invoices[0];

    // Get invoice details (items)
    const invoiceDetails = await db`
      SELECT 
        id.product_id,
        id.quantity,
        id.price,
        id.product_name,
        id.image_path
      FROM invoices_details id
      WHERE id.invoice_id = ${orderId}
    `;

    const out = {
      id: invoice.id,
      createdAt: invoice.created_at,
      total: invoice.total,
      status: invoice.status,
      customer: {
        name: invoice.customer_name ?? "Customer",
        email: invoice.customer_email ?? "",
      },
      items: order.items.map((it) => ({
        id: it.id,
        product_id: it.product_id,
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
