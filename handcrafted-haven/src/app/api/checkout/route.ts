// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import { getCurrentUserFromHeaders } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromHeaders(request.headers);
    if (!user?.user_id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const uid = user.user_id;
    const role = (user.role || "CUSTOMER").toUpperCase();

    const allowedRoles = ["CUSTOMER", "SELLER", "ADMIN"];
    if (!allowedRoles.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const db = connectDB;

    // For customers, we use the user_id directly since there's no separate customers table
    const customer_id = uid;

    // Get cart items with products
    const cartItems = await db`
      SELECT ci.*, p.product_name, p.price, p.description, p.category, p.image_path
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
    const orderItemsData = cartItems.map(ci => {
      const price = ci.price ?? 0;
      total += price * ci.quantity;
      return { product_id: ci.product_id, quantity: ci.quantity, price };
    });

    // Create invoice
    const invoiceNumber = `INV-${Date.now()}`;
    const newInvoice = await db`
      INSERT INTO invoices (invoice_number, user_id, date, insert_dt, update_dt)
      VALUES (${invoiceNumber}, ${customer_id}, CURRENT_DATE, NOW(), NOW())
      RETURNING *
    `;
    const invoice = newInvoice[0];

    // Create invoice details
    for (const item of orderItemsData) {
      const totalPrice = item.price * item.quantity;
      await db`
        INSERT INTO invoices_details (invoice_id, product_id, price, qty, total_price, insert_dt, update_dt)
        VALUES (${invoice.invoice_id}, ${item.product_id}, ${item.price}, ${item.quantity}, ${totalPrice}, NOW(), NOW())
      `;
    }

    // Clear cart
    await db`DELETE FROM cart_items WHERE user_id = ${uid}`;

    return NextResponse.json({ invoice_id: invoice.invoice_id, invoice_number: invoice.invoice_number }, { status: 200 });

  } catch (err) {
    console.error("POST /api/checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
