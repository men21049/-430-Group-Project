// src/app/api/orders/[orderId]/invoice/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";

export async function GET(
  req: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    // Await the params to get the orderId
    const { orderId } = await context.params;
    const db = connectDB;

    // Fetch invoice with customer info
    const invoices = await db`
      SELECT 
        i.invoice_id,
        i.total,
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

    // Fetch invoice details (items)
    const invoiceDetails = await db`
      SELECT 
        id.product_name,
        id.quantity,
        id.price
      FROM invoices_details id
      WHERE id.invoice_id = ${orderId}
    `;

    // Build invoice content
    const customerName = invoice.customer_name ?? "Customer";
    const customerEmail = invoice.customer_email ?? "";
    let content = `HANDCRAFTED HAVEN INVOICE\n`;
    content += `Order ID: ${invoice.invoice_id}\n`;
    content += `Date: ${invoice.created_at.toISOString()}\n\n`;
    content += `Bill To: ${customerName}\n`;
    if (customerEmail) content += `${customerEmail}\n`;
    content += `\nItems:\n`;

    invoiceDetails.forEach((it, index) => {
      const name = it.product_name ?? "Item";
      const qty = it.quantity;
      const unit = it.price.toFixed(2);
      const line = (it.price * it.quantity).toFixed(2);
      content += `${index + 1}. ${name} x${qty} @ $${unit} = $${line}\n`;
    });

    content += `\nTOTAL: $${invoice.total.toFixed(2)}\n`;
    content += `\nThank you for your purchase!\n`;

    // Convert to Uint8Array
    const encoder = new TextEncoder();
    const buffer = encoder.encode(content);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename=invoice-${invoice.invoice_id}.txt`,
      },
    });
  } catch (err) {
    console.error("GET invoice error:", err);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
