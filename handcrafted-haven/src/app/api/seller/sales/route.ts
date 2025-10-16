// src/app/api/seller/sales/route.ts
import connectDB from "@/app/lib/database";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const sellerId = new URL(req.url).searchParams.get('sellerId');
    if (!sellerId) return NextResponse.json({ totalRevenue: 0, totalOrders: 0, perProduct: [] });

    const db = connectDB;
    const items = await db`
      SELECT 
        id.product_id,
        id.quantity,
        id.price,
        id.product_name,
        p.seller_id
      FROM invoices_details id
      INNER JOIN products p ON id.product_id = p.product_id
      WHERE p.seller_id = ${sellerId}
    `;

    const totalRevenue = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const perProductMap: Record<string, { productId: string; name: string; revenue: number; qty: number }> = {};

    items.forEach((i) => {
      const pid = i.product_id;
      if (!perProductMap[pid]) perProductMap[pid] = { productId: pid, name: i.product_name, revenue: 0, qty: 0 };
      perProductMap[pid].revenue += i.price * i.quantity;
      perProductMap[pid].qty += i.quantity;
    });

    return NextResponse.json({
      totalRevenue,
      totalOrders: items.reduce((sum, i) => sum + i.quantity, 0),
      perProduct: Object.values(perProductMap),
    });
  } catch (err) {
    console.error("GET /api/seller/sales error:", err);
    return NextResponse.json({ error: "Failed to compute sales" }, { status: 500 });
  }
}
