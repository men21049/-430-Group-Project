import { NextRequest, NextResponse } from "next/server";
import { getProductsFromDB } from "@/app/lib/data"; // server-only import

export async function GET(req: NextRequest) {

  try {
    const products = await getProductsFromDB();
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch products" }, { status: 500 });
  }
}
