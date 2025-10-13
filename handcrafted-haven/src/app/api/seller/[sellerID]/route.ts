// src/app/api/seller/[sellerID]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSellerInfo } from "@/app/lib/data";

export async function GET(_: NextRequest, context: { params: Promise<{ sellerID: string }> }) {
  try {
    const { sellerID } = await context.params;
    const seller = await getSellerInfo(sellerID);
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }
    return NextResponse.json(seller);
  } catch (error: any) {
    console.error("GET /api/seller/[sellerID] error:", error);
    return NextResponse.json({ error: error.message ?? "Server error" }, { status: 500 });
  }
}
