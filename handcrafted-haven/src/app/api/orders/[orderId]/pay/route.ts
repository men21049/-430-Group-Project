import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/database";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  // await the params promise
  const { orderId } = await context.params;

  try {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/userId=([^;]+)/);
    const userId = match?.[1];

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = connectDB;

    // Get invoice details
    const invoices = await db`
      SELECT 
        i.invoice_id,
        i.customer_id,
        i.status
      FROM invoices i
      WHERE i.invoice_id = ${orderId}
    `;

    if (invoices.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const invoice = invoices[0];

    // Check permissions
    let allowed = false;
    if (invoice.customer_id === userId) allowed = true;

    // Check if user is a seller of any products in this invoice
    const sellerProducts = await db`
      SELECT DISTINCT p.seller_id
      FROM invoices_details id
      INNER JOIN products p ON id.product_id = p.product_id
      WHERE id.invoice_id = ${orderId}
    `;

    const sellerIds = new Set(sellerProducts.map((sp) => sp.seller_id));
    
    // Check if user has a seller profile that matches any of the seller_ids
    const userSellers = await db`
      SELECT seller_id FROM sellers 
      WHERE seller_name LIKE ${`%${userId}%`}
    `;
    
    const userSellerIds = new Set(userSellers.map((us) => us.seller_id));
    const hasMatchingSeller = [...sellerIds].some(sid => userSellerIds.has(sid));
    
    if (hasMatchingSeller) allowed = true;

    // Check if user is admin
    const users = await db`SELECT role FROM users WHERE user_id = ${userId}`;
    if (users.length > 0 && users[0].role === "ADMIN") allowed = true;

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db`
      UPDATE invoices 
      SET status = 'PAID', update_dt = NOW()
      WHERE invoice_id = ${orderId}
      RETURNING *
    `;

    return NextResponse.json({ ok: true, order: updated[0] });
  } catch (err) {
    console.error("POST /api/orders/[orderId]/pay error:", err);
    return NextResponse.json({ error: "Failed to mark order paid" }, { status: 500 });
  }
}
