import { NextRequest, NextResponse } from "next/server";
import { getAllSellerProducts as getProductsFromDb } from "@/app/lib/data"; // server-only import

export async function GET(req: NextRequest) {
  const sellerId = req.nextUrl.searchParams.get("sellerId") || "seller1";

  try {
    const products = await getProductsFromDb(sellerId);
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch products" }, { status: 500 });
  }
}
