// handcrafted-haven/src/app/api/orders/[orderId]/invoice/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import PDFDocument from "pdfkit";

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;

  try {
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

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfEnd = new Promise<Buffer>((resolve) =>
      doc.on("end", () => resolve(Buffer.concat(chunks)))
    );

    // Header
    doc.fontSize(20).text("Handcrafted Haven", { align: "left" });
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor("gray").text("www.handcrafted-haven.example", { align: "left" });
    doc.moveDown(0.8);
    doc.fillColor("black");

    // Invoice metadata
    doc.fontSize(12).text(`Invoice: ${order.id}`, { continued: true });
    doc.text(``, { align: "right" });
    doc.moveDown(0.1);
    doc.fontSize(10).text(`Date: ${order.createdAt.toISOString()}`, { align: "right" });
    doc.moveDown(0.8);

    // Customer block
    doc.fontSize(12).text("Bill To:", { underline: true });
    const customerName = order.customer.user?.name ?? "Customer";
    const customerEmail = order.customer.user?.email ?? "";
    doc.fontSize(10).text(customerName);
    if (customerEmail) doc.text(customerEmail);
    doc.moveDown(0.8);

    // Items header
    doc.fontSize(11).text("Items", { underline: true });
    doc.moveDown(0.3);

    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text("Item", 40, tableTop, { width: 260 });
    doc.text("Qty", 320, tableTop, { width: 60, align: "right" });
    doc.text("Unit", 380, tableTop, { width: 80, align: "right" });
    doc.text("Total", 460, tableTop, { width: 90, align: "right" });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor("#cccccc").stroke();
    doc.moveDown(0.2);

    // Items rows
    order.items.forEach((it) => {
      const name = it.product?.name ?? "Item";
      const qty = it.quantity;
      const unit = it.price.toFixed(2);
      const line = (it.price * it.quantity).toFixed(2);
      const y = doc.y;

      doc.text(name, 40, y, { width: 260 });
      doc.text(String(qty), 320, y, { width: 60, align: "right" });
      doc.text(`$${unit}`, 380, y, { width: 80, align: "right" });
      doc.text(`$${line}`, 460, y, { width: 90, align: "right" });
      doc.moveDown(0.8);
    });

    // Totals
    doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor("#cccccc").stroke();
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Subtotal:`, 380, doc.y, { width: 120, align: "right" });
    doc.text(`$${order.total.toFixed(2)}`, 460, doc.y, { width: 90, align: "right" });
    doc.moveDown(0.6);

    // Footer
    doc.fontSize(9).fillColor("gray").text("Thank you for your purchase!", 40, doc.y);
    doc.end();

    const buffer = await pdfEnd;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${order.id}.pdf`,
      },
    });
  } catch (err) {
    console.error("GET invoice error:", err);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
