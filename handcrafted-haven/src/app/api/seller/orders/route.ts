// src/app/api/seller/orders/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getCurrentUserFromRequest, isAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sellerIdQuery = url.searchParams.get("sellerId") || null;

    let sellerId = sellerIdQuery;

    if (!sellerId) {
      // try to infer from authenticated user
      const user = getCurrentUserFromRequest(req);
      if (!user?.userId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      // Admin may request all
      if (isAdmin(user) && !sellerIdQuery) {
        // admin wants all orders: return orders (paginated in future)
        const allOrders = await prisma.order.findMany({
          include: { items: { include: { product: true } }, customer: { include: { user: true } } },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(allOrders);
      }
      const seller = await prisma.seller.findUnique({ where: { userId: user.userId } });
      if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
      sellerId = seller.id;
    }

    // find orders that contain at least one order item with a product from this seller
    const orders = await prisma.order.findMany({
      where: { items: { some: { product: { sellerId } } } },
      include: {
        items: { include: { product: true } },
        customer: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error("GET /api/seller/orders error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
