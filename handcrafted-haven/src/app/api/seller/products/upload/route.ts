// src/app/api/seller/products/upload/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import fs from "fs/promises";
import path from "path";
import { getCurrentUserFromRequest, isSellerOrAdmin, isAdmin } from "@/lib/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    const user = getCurrentUserFromRequest(req);
    if (!user?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!isSellerOrAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();

    // Admin may pass sellerId in form data
    const explicitSellerId = String(formData.get("sellerId") || "").trim() || null;

    const name = String(formData.get("name") || "");
    const price = String(formData.get("price") || "");
    const category = String(formData.get("category") || "");
    const imageFile = formData.get("image") as File | null;

    if (!name || !price) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Resolve seller ID to associate the product with
    let targetSellerId: string | null = null;
    if (isAdmin(user) && explicitSellerId) {
      const s = await prisma.seller.findUnique({ where: { id: explicitSellerId } });
      if (!s) return NextResponse.json({ error: "Specified seller not found" }, { status: 404 });
      targetSellerId = s.id;
    } else {
      const seller = await prisma.seller.findUnique({ where: { userId: user.userId } });
      if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
      targetSellerId = seller.id;
    }

    // Save image file if present
    let imagePath: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public", "artisans");
      await fs.mkdir(uploadDir, { recursive: true });

      const safeName = imageFile.name.replace(/\s+/g, "-");
      const fileName = `${Date.now()}-${safeName}`;
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      imagePath = `/artisans/${fileName}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        category: category || null,
        image: imagePath,
        sellerId: targetSellerId,
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("POST /api/seller/products/upload error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
