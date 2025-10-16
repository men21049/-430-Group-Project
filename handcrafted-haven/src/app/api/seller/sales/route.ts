// src/app/api/seller/sales/route.ts
import connectDB from "@/app/lib/database";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const seller_id = new URL(req.url).searchParams.get('seller_id');
    if (!seller_id) return NextResponse.json({ totalRevenue: 0, totalInvoices: 0, perProduct: [] });

    const items = const db = connectDB; await dborderItem.findMany({
      where: { product: { seller_id } },
      include: { product: true },
    });

    const totalRevenue = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const perProductMap: Record<string, { product_id: string; name: string; revenue: number; qty: number }> = {};

    items.forEach((i) => {
      const pid = i.product_id;
      if (!perProductMap[pid]) perProductMap[pid] = { product_id: pid, name: i.product.name, revenue: 0, qty: 0 };
      perProductMap[pid].revenue += i.price * i.quantity;
      perProductMap[pid].qty += i.quantity;
    });

    return NextResponse.json({
      totalRevenue,
      totalInvoices: items.reduce((sum, i) => sum + i.quantity, 0),
      perProduct: Object.values(perProductMap),
    });
  } catch (err) {
    console.error("GET /api/seller/sales error:", err);
    return NextResponse.json({ error: "Failed to compute sales" }, { status: 500 });
  }
}
