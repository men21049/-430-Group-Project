import prisma from '@/prisma/client';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const sellerId = new URL(req.url).searchParams.get('sellerId');
  if (!sellerId) return NextResponse.json({ totalRevenue: 0, totalOrders: 0, perProduct: [] });

  const items = await prisma.orderItem.findMany({
    where: { product: { sellerId } },
    include: { product: true },
  });

  const totalRevenue = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const perProductMap: Record<string, { productId: string; name: string; revenue: number; qty: number }> = {};

  items.forEach((i) => {
    const pid = i.productId;
    if (!perProductMap[pid]) perProductMap[pid] = { productId: pid, name: i.product.name, revenue: 0, qty: 0 };
    perProductMap[pid].revenue += i.price * i.quantity;
    perProductMap[pid].qty += i.quantity;
  });

  return NextResponse.json({
    totalRevenue,
    totalOrders: items.reduce((sum, i) => sum + i.quantity, 0),
    perProduct: Object.values(perProductMap),
  });
}
