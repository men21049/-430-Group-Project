// src/app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/database";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;
    const db = connectDB;

    // Get invoice details (since we're using invoices table now)
    const invoices = await db`
      SELECT 
        i.invoice_id as id,
        i.customer_id,
        i.total,
        i.status,
        i.insert_dt as created_at,
        u.name as customer_name,
        u.email as customer_email
      FROM invoices i
      LEFT JOIN users u ON i.customer_id = u.user_id
      WHERE i.invoice_id = ${orderId}
    `;

    if (invoices.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
      items: invoiceDetails.map((it) => ({
        id: it.product_id,
        productId: it.product_id,
        name: it.product_name ?? "Unknown",
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
