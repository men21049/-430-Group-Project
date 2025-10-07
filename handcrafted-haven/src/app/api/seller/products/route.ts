// src/app/api/seller/products/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getCurrentUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  const user = getCurrentUserFromRequest(req);
  if (!user?.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const seller = await prisma.seller.findUnique({ where: { userId: user.userId } });
  if (!seller) return NextResponse.json({ error: "No seller profile found" }, { status: 404 });

  const products = await prisma.product.findMany({ where: { sellerId: seller.id } });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const user = getCurrentUserFromRequest(req);
  if (!user?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const { name, price, category, image } = body;

  if (!name || !price) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const seller = await prisma.seller.findUnique({ where: { userId: user.userId } });
  if (!seller) return NextResponse.json({ error: "No seller profile found" }, { status: 404 });

  const product = await prisma.product.create({
    data: {
      name,
      price: parseFloat(String(price)),
      category,
      image,
      sellerId: seller.id,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(req: Request) {
  const user = getCurrentUserFromRequest(req);
  if (!user?.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing product id" }, { status: 400 });

  // Optional: ensure this product belongs to the seller
  const seller = await prisma.seller.findUnique({ where: { userId: user.userId } });
  if (!seller) return NextResponse.json({ error: "No seller profile found" }, { status: 404 });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.sellerId !== seller.id) {
    return NextResponse.json({ error: "Product not found or not owned by you" }, { status: 404 });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
