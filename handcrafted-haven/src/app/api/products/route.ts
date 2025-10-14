import { getProductsFromDB } from "@/app/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = getProductsFromDB();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
