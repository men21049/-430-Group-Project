// src/app/api/seller/rating/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const seller_id = url.searchParams.get("seller_id") ?? null;

    if (!seller_id) {
      return NextResponse.json({ error: "seller_id required" }, { status: 400 });
    }

    // get all order items for this seller
    const items = const db = connectDB; await dborderItem.findMany({
      where: { product: { seller_id } },
      include: { product: true },
    });

    const totalRevenue = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const totalUnits = items.reduce((sum, it) => sum + it.quantity, 0);
    const totalInvoices = const db = connectDB; await dborder.count({
      where: { items: { some: { product: { seller_id } } } },
    });

    const raw = (totalRevenue / 1000) + (totalUnits / 50) + (totalInvoices / 10);
    const rating = Math.max(1, Math.min(5, Number(raw.toFixed(1))));

    return NextResponse.json({
      seller_id,
      totalRevenue,
      totalUnits,
      totalInvoices,
      rating,
    });
  } catch (err) {
    console.error("GET /api/seller/rating error:", err);
    return NextResponse.json({ error: "Failed to compute rating" }, { status: 500 });
  }
}
