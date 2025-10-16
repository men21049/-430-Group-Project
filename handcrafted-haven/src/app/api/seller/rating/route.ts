// src/app/api/seller/rating/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sellerId = url.searchParams.get("sellerId") ?? null;

    if (!sellerId) {
      return NextResponse.json({ error: "sellerId required" }, { status: 400 });
    }

    const db = connectDB;
    // get all invoice details for this seller
    const items = await db`
      SELECT 
        id.product_id,
        id.quantity,
        id.price,
        p.seller_id
      FROM invoices_details id
      INNER JOIN products p ON id.product_id = p.product_id
      WHERE p.seller_id = ${sellerId}
    `;

    const totalRevenue = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const totalUnits = items.reduce((sum, it) => sum + it.quantity, 0);
    
    // Count unique invoices for this seller
    const orderCounts = await db`
      SELECT COUNT(DISTINCT i.invoice_id) as total_orders
      FROM invoices i
      INNER JOIN invoices_details id ON i.invoice_id = id.invoice_id
      INNER JOIN products p ON id.product_id = p.product_id
      WHERE p.seller_id = ${sellerId}
    `;
    const totalOrders = orderCounts[0]?.total_orders || 0;

    const raw = (totalRevenue / 1000) + (totalUnits / 50) + (totalOrders / 10);
    const rating = Math.max(1, Math.min(5, Number(raw.toFixed(1))));

    return NextResponse.json({
      sellerId,
      totalRevenue,
      totalUnits,
      totalOrders,
      rating,
    });
  } catch (err) {
    console.error("GET /api/seller/rating error:", err);
    return NextResponse.json({ error: "Failed to compute rating" }, { status: 500 });
  }
}
