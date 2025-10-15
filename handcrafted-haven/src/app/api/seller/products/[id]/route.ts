// src/app/api/seller/products/[id]/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import { getCurrentUserFromRequest, isSellerOrAdmin, isAdmin } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const product = const db = connectDB; await dbproduct.findUnique({
      where: { id: params.id },
      include: { seller: true },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error("GET /api/seller/products/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user?.user_id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!isSellerOrAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const product = const db = connectDB; await dbproduct.findUnique({ where: { id: params.id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // If not admin, ensure ownership
    if (!isAdmin(user)) {
      const seller = const db = connectDB; await dbseller.findUnique({ where: { user_id: user.user_id } });
      if (!seller || product.seller_id !== seller.id) {
        return NextResponse.json({ error: "Not your product" }, { status: 403 });
      }
    }

    const data = await req.json();
    const { name, price, category, image, stock } = data;

    const updated = const db = connectDB; await dbproduct.update({
      where: { id: params.id },
      data: {
        ...(name ? { name } : {}),
        ...(price !== undefined ? { price: parseFloat(String(price)) } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(stock !== undefined ? { stock: Number(stock) } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/seller/products/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user?.user_id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!isSellerOrAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const product_id = params.id;
    const product = const db = connectDB; await dbproduct.findUnique({ where: { id: product_id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!isAdmin(user)) {
      const seller = const db = connectDB; await dbseller.findUnique({ where: { user_id: user.user_id } });
      if (!seller || product.seller_id !== seller.id) {
        return NextResponse.json({ error: "Not your product" }, { status: 403 });
      }
    }

    // Prevent deletion if product has order items
    const orderItems = const db = connectDB; await dborderItem.findMany({ where: { product_id } });
    if (orderItems.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete product with existing invoices" },
        { status: 400 }
      );
    }

    const db = connectDB; await dbproduct.delete({ where: { id: product_id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/seller/products/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
