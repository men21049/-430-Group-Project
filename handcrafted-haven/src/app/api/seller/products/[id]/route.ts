// src/app/api/seller/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getCurrentUserFromRequest, isSellerOrAdmin, isAdmin } from "@/lib/auth";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { seller: true },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    console.error("GET /api/seller/products/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = getCurrentUserFromRequest(req);
    if (!user?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!isSellerOrAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!isAdmin(user)) {
      const seller = await prisma.seller.findUnique({ where: { userId: user.userId } });
      if (!seller || product.sellerId !== seller.id) {
        return NextResponse.json({ error: "Not your product" }, { status: 403 });
      }
    }

    const data = await req.json();
    const { name, price, category, image, stock } = data;

    const updated = await prisma.product.update({
      where: { id },
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

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = getCurrentUserFromRequest(req);
    if (!user?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!isSellerOrAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!isAdmin(user)) {
      const seller = await prisma.seller.findUnique({ where: { userId: user.userId } });
      if (!seller || product.sellerId !== seller.id) {
        return NextResponse.json({ error: "Not your product" }, { status: 403 });
      }
    }

    const orderItems = await prisma.orderItem.findMany({ where: { productId: id } });
    if (orderItems.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete product with existing orders" },
        { status: 400 }
      );
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/seller/products/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
