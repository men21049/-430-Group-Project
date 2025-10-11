// src/app/api/seller/[sellerID]/products/route.ts
import { NextResponse } from "next/server";
import { getAllSellerProducts } from "@/app/lib/data";

export async function GET(_: Request, { params }: { params: { sellerID: string } }) {
  try {
    const { sellerID } = params;
    // Optional: if you want a query param for category, extract it:
    // const url = new URL(request.url); const category = url.searchParams.get('category') ?? undefined;
    const products = await getAllSellerProducts(sellerID);
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("GET /api/seller/[sellerID]/products error:", error);
    return NextResponse.json({ error: error.message ?? "Server error" }, { status: 500 });
  }
}
