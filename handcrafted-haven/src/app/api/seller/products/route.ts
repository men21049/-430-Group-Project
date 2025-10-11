// src/app/api/seller/products/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import {
  getCurrentUserFromRequest,
  isSellerOrAdmin,
  isAdmin,
} from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Admin can fetch all products
    if (isAdmin(user)) {
      const all = await prisma.product.findMany({
        include: { seller: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(all);
    }

    // Seller: fetch products belonging to their seller profile
    if (!isSellerOrAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const seller = await prisma.seller.findUnique({ where: { userId: user.userId } });
    if (!seller) return NextResponse.json({ error: "No seller profile found" }, { status: 404 });

    const products = await prisma.product.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /api/seller/products error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Allow SELLER and ADMIN to create products
    if (!isSellerOrAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, price, category, image, sellerId: explicitSellerId } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // If admin provided explicit sellerId, use it; otherwise use seller associated with the user
    let targetSellerId: string | null = null;
    if (isAdmin(user) && explicitSellerId) {
      // ensure seller exists
      const s = await prisma.seller.findUnique({ where: { id: explicitSellerId } });
      if (!s) return NextResponse.json({ error: "Specified seller not found" }, { status: 404 });
      targetSellerId = s.id;
    } else {
      const seller = await prisma.seller.findUnique({ where: { userId: user.userId } });
      if (!seller) return NextResponse.json({ error: "No seller profile found" }, { status: 404 });
      targetSellerId = seller.id;
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(String(price)),
        category: category || null,
        image: image || null,
        sellerId: targetSellerId,
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("POST /api/seller/products error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    if (!isSellerOrAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // If not admin, ensure product belongs to seller
    if (!isAdmin(user)) {
      const seller = await prisma.seller.findUnique({ where: { userId: user.userId } });
      if (!seller || product.sellerId !== seller.id) {
        return NextResponse.json({ error: "Product not owned by you" }, { status: 403 });
      }
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/seller/products error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
