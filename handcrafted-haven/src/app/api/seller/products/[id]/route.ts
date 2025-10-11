import { NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct } from "@/app/lib/data";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();
  const { name, price, category, image } = data;
  const updated = await updateProduct(params.id, name, price, category, image);
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await deleteProduct(params.id);
  return NextResponse.json({ success: true });
}
