// src/app/api/seller/products/upload/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import fs from "fs/promises";
import path from "path";
import { getCurrentUserFromRequest } from "@/lib/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  const user = getCurrentUserFromRequest(req);
  if (!user?.userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const seller = await prisma.seller.findUnique({ where: { userId: user.userId } });
  if (!seller) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const name = String(formData.get("name") || "");
  const price = String(formData.get("price") || "");
  const category = String(formData.get("category") || "");
  const imageFile = formData.get("image") as File | null;

  if (!name || !price) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Save image file
  let imagePath: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "artisans");
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${imageFile.name}`;
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
      sellerId: seller.id,
    },
  });

  return NextResponse.json(product);
}
