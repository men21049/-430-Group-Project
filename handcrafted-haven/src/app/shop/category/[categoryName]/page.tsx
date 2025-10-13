// src/app/shop/category/[categoryName]/page.tsx
import prisma from '@/prisma/client';
import ProductCard from '@/app/shop/ProductCard';
import Header from '@/app/ui/landing-page/header';
import Footer from '@/app/ui/footer';
import Link from 'next/link';

interface CategoryPageProps {
  params: { categoryName: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryName } = params;

  // Fetch all products in this category (all sellers)
  const products = await prisma.product.findMany({
    where: { category: { equals: categoryName, mode: 'insensitive' } },
    include: { seller: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Category Banner */}
      <section className="relative bg-gradient-to-r from-amber-200 to-orange-100 py-12 mb-6 text-center">
        <h1 className="text-4xl font-bold capitalize text-gray-800">
          {categoryName} Collection
        </h1>
        <p className="text-gray-600 mt-2">
          Discover handcrafted {categoryName.toLowerCase()} products from all our sellers.
        </p>
      </section>

      {/* Products Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pb-10">
        {products.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image ?? '/artisans/amin-ybW2t0bEqm0-unsplash.jpg'}
                  sellerName={product.seller?.shopName ?? 'Unknown Seller'}
                  showAddToCart={true}
                />
                <p className="text-sm text-gray-500 mt-1 text-center">
                  Sold by{' '}
                  <Link
                    href={`/shop/${product.sellerId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {product.seller?.shopName ?? 'Unknown Seller'}
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-16">
            No products found in this category.
          </p>
        )}
      </main>

    </div>
  );
}
