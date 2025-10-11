// src/app/shop/page.tsx
import prisma from '@/prisma/client';
import ProductCard from './ProductCard'; // Client Component

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    include: { seller: { select: { id: true, shopName: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Shop All Products</h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image || undefined}
            sellerName={product.seller.shopName}
          />
        ))}
      </ul>
    </div>
  );
}
