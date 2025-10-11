// handcrafted-haven/src/app/api/seller/rating/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sellerId = url.searchParams.get("sellerId") ?? null;

    if (!sellerId) {
      return NextResponse.json({ error: "sellerId required" }, { status: 400 });
    }

    // get all order items for this seller
    const items = await prisma.orderItem.findMany({
      where: { product: { sellerId } },
      include: { product: true },
    });

    const totalRevenue = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const totalUnits = items.reduce((sum, it) => sum + it.quantity, 0);
    const totalOrders = await prisma.order.count({
      where: { items: { some: { product: { sellerId } } } },
    });

    // simple rating formula (example): base on revenue and volume
    // scaling: revenue/1000 gives contribution up to reasonable numbers, units/50 adds a small boost.
    // clamp to [1,5]
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
