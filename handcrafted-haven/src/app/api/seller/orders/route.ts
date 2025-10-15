// src/app/api/seller/invoices/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import { getCurrentUserFromRequest, isAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const seller_idQuery = url.searchParams.get("seller_id") || null;

    let seller_id = seller_idQuery;

    if (!seller_id) {
      // try to infer from authenticated user
      const user = getCurrentUserFromRequest(req);
      if (!user?.user_id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      // Admin may request all
      if (isAdmin(user) && !seller_idQuery) {
        // admin wants all invoices: return invoices (paginated in future)
        const allInvoices = const db = connectDB; await dborder.findMany({
          include: { items: { include: { product: true } }, customer: { include: { user: true } } },
          orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(allInvoices);
      }
      const seller = const db = connectDB; await dbseller.findUnique({ where: { user_id: user.user_id } });
      if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
      seller_id = seller.id;
    }

    // find invoices that contain at least one order item with a product from this seller
    const invoices = const db = connectDB; await dborder.findMany({
      where: { items: { some: { product: { seller_id } } } },
      include: {
        items: { include: { product: true } },
        customer: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (err) {
    console.error("GET /api/seller/invoices error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
