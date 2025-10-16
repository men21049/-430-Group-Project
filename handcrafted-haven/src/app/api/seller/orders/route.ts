// src/app/api/seller/orders/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import { getCurrentUserFromRequest, isAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sellerIdQuery = url.searchParams.get("sellerId") || null;
    const db = connectDB;

    let sellerId = sellerIdQuery;

    if (!sellerId) {
      // try to infer from authenticated user
      const user = getCurrentUserFromRequest(req);
      if (!user?.userId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      // Admin may request all
      if (isAdmin(user) && !sellerIdQuery) {
        // admin wants all orders: return invoices (paginated in future)
        const allInvoices = await db`
          SELECT 
            i.invoice_id as id,
            i.customer_id,
            i.total,
            i.status,
            i.insert_dt as created_at,
            u.name as customer_name,
            u.email as customer_email
          FROM invoices i
          LEFT JOIN users u ON i.customer_id = u.user_id
          ORDER BY i.insert_dt DESC
        `;
        return NextResponse.json(allInvoices);
      }
      
      // Find seller profile for this user
      const sellers = await db`
        SELECT seller_id FROM sellers 
        WHERE seller_name LIKE ${`%${user.name}%`}
      `;
      if (sellers.length === 0) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
      sellerId = sellers[0].seller_id;
    }

    // find invoices that contain at least one item with a product from this seller
    const invoices = await db`
      SELECT DISTINCT
        i.invoice_id as id,
        i.customer_id,
        i.total,
        i.status,
        i.insert_dt as created_at,
        u.name as customer_name,
        u.email as customer_email
      FROM invoices i
      LEFT JOIN users u ON i.customer_id = u.user_id
      INNER JOIN invoices_details id ON i.invoice_id = id.invoice_id
      INNER JOIN products p ON id.product_id = p.product_id
      WHERE p.seller_id = ${sellerId}
      ORDER BY i.insert_dt DESC
    `;

    return NextResponse.json(invoices);
  } catch (err) {
    console.error("GET /api/seller/orders error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
