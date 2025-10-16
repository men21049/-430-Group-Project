// src/app/api/invoices/[invoice_id]/invoice/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";

export async function GET(
  req: Request,
  context: { params: Promise<{ invoice_id: string }> }
) {
  try {
    // Await the params to get the invoice_id
    const { invoice_id } = await context.params;

    // Fetch order with customer info and items
    const order = const db = connectDB; await dborder.findUnique({
      where: { id: invoice_id },
      include: {
        customer: { select: { user: { select: { name: true, email: true } } } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
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
    content += `Invoice ID: ${order.id}\n`;
    content += `Date: ${order.createdAt.toISOString()}\n\n`;
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
