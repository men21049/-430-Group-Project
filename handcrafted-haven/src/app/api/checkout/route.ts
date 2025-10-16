// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import { getCurrentUserFromHeaders } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromHeaders(request.headers);
    if (!user?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const uid = user.userId;
    const role = (user.role || "CUSTOMER").toUpperCase();

    const allowedRoles = ["CUSTOMER", "SELLER", "ADMIN"];
    if (!allowedRoles.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const db = connectDB;
    const customerId = uid; // Use user_id directly as customer_id

    const cartItems = await db`
      SELECT ci.*, p.product_name, p.price, p.image_path
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.product_id
      WHERE ci.user_id = ${uid}
    `;

    if (!cartItems.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const missingProducts: string[] = [];
    for (const ci of cartItems) {
      if (!ci.product_name) missingProducts.push(ci.product_id);
    }
    if (missingProducts.length) return NextResponse.json({ error: "Some products not found", missingProducts }, { status: 400 });

    let total = 0;
    const invoiceDetailsData = cartItems.map(ci => {
      const price = ci.price ?? 0;
      total += price * ci.quantity;
      return { 
        product_id: ci.product_id, 
        quantity: ci.quantity, 
        price,
        product_name: ci.product_name,
        image_path: ci.image_path
      };
    });

    // Create invoice and invoice details
    const createdInvoice = await db`
      INSERT INTO invoices (customer_id, total, status, insert_dt, update_dt)
      VALUES (${customerId}, ${total}, 'PENDING', NOW(), NOW())
      RETURNING *
    `;

    const invoiceId = createdInvoice[0].invoice_id;

    // Insert invoice details
    for (const detail of invoiceDetailsData) {
      await db`
        INSERT INTO invoices_details (invoice_id, product_id, quantity, price, product_name, image_path, insert_dt, update_dt)
        VALUES (${invoiceId}, ${detail.product_id}, ${detail.quantity}, ${detail.price}, ${detail.product_name}, ${detail.image_path}, NOW(), NOW())
      `;
    }

    // Clear cart
    await db`DELETE FROM cart_items WHERE user_id = ${uid}`;

    return NextResponse.json({ invoiceId: invoiceId }, { status: 200 });

  } catch (err) {
    console.error("POST /api/checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
