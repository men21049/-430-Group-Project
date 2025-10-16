import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";

// GET /api/orders
export async function GET(req: Request) {
  try {
    // extract userId from cookie
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.match(/userId=([^;]+)/);
    const userId = match?.[1];

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = connectDB;
    const users = await db`SELECT * FROM users WHERE user_id = ${userId}`;
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }
    const user = users[0];

    let invoices;

    if (user.role === "ADMIN") {
      // admin sees all invoices
      invoices = await db`
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
    } else if (user.role === "SELLER") {
      // seller sees invoices with their products
      invoices = await db`
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
        WHERE p.seller_id = (
          SELECT seller_id FROM sellers WHERE seller_name LIKE ${`%${user.name}%`}
        )
        ORDER BY i.insert_dt DESC
      `;
    } else {
      // customer sees only own invoices
      invoices = await db`
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
        WHERE i.customer_id = ${userId}
        ORDER BY i.insert_dt DESC
      `;
    }

    // Get invoice details for each invoice
    const out = [];
    for (const invoice of invoices) {
      const details = await db`
        SELECT 
          id.invoice_detail_id as id,
          id.product_id,
          id.quantity,
          id.price,
          id.product_name as name,
          p.seller_id
        FROM invoices_details id
        LEFT JOIN products p ON id.product_id = p.product_id
        WHERE id.invoice_id = ${invoice.id}
      `;

      out.push({
        id: invoice.id,
        createdAt: invoice.created_at,
        total: invoice.total,
        status: invoice.status,
        customerName: invoice.customer_name,
        customerEmail: invoice.customer_email,
        items: details.map((it) => ({
          id: it.id,
          productId: it.product_id,
          name: it.name ?? "Unknown",
          quantity: it.quantity,
          price: it.price,
          sellerId: it.seller_id ?? null,
        })),
      });
    }

    return NextResponse.json(out);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders - Create invoice
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: { id: string; quantity: number }[] = body.items ?? [];

    // get customerId from body or cookie
    const cookie = req.headers.get("cookie") || "";
    const cookieMatch = cookie.match(/userId=([^;]+)/);
    const customerId = body.customerId ?? cookieMatch?.[1];

    if (!customerId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    const db = connectDB;
    const invoiceDetailsData: { productId: string; quantity: number; price: number; productName: string; imagePath: string }[] = [];
    let total = 0;

    for (const it of items) {
      const products = await db`SELECT * FROM products WHERE product_id = ${it.id}`;
      if (products.length === 0) {
        return NextResponse.json({ error: `Product not found: ${it.id}` }, { status: 400 });
      }
      const product = products[0];
      const price = product.price;
      const qty = Math.max(1, Math.floor(it.quantity || 1));
      total += price * qty;
      invoiceDetailsData.push({ 
        productId: product.product_id, 
        quantity: qty, 
        price,
        productName: product.product_name,
        imagePath: product.image_path
      });
    }

    // Create invoice
    const newInvoices = await db`
      INSERT INTO invoices (customer_id, total, status, insert_dt, update_dt)
      VALUES (${customerId}, ${total}, 'COMPLETED', NOW(), NOW())
      RETURNING *
    `;
    const invoice = newInvoices[0];

    // Create invoice details
    for (const detail of invoiceDetailsData) {
      await db`
        INSERT INTO invoices_details (invoice_id, product_id, quantity, price, product_name, image_path, insert_dt, update_dt)
        VALUES (${invoice.invoice_id}, ${detail.productId}, ${detail.quantity}, ${detail.price}, ${detail.productName}, ${detail.imagePath}, NOW(), NOW())
      `;
    }

    return NextResponse.json({ ok: true, orderId: invoice.invoice_id, invoice }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create order" }, { status: 500 });
  }
}
