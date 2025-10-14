// src/app/shop/category/[categoryName]/page.tsx
import ProductCard from '@/app/shop/ProductCard';
import { getProductsFromDB } from "@/app/lib/data";
import Link from 'next/link';

interface CategoryPageProps {
  params: { categoryName: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const { categoryName } = resolvedParams;

  // Fetch all products in this category (all sellers)
  const products = await getProductsFromDB();
  
  // Normalize category names for comparison (case-insensitive)
  const normalizedCategoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();
  const filteredProducts = products.filter((product) => 
    product.category?.toLowerCase() === categoryName.toLowerCase()
  );
  


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Category Banner */}
      <section className="relative bg-gradient-to-r from-amber-200 to-orange-100 py-12 mb-6 text-center">
        <h1 className="text-4xl font-bold capitalize text-gray-800">
          {normalizedCategoryName} Collection
        </h1>
        <p className="text-gray-600 mt-2">
          Discover handcrafted {normalizedCategoryName.toLowerCase()} products from all our sellers.
        </p>
      </section>

      {/* Products Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pb-10">
        {filteredProducts.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <li key={product.product_id}>
                <ProductCard
                  id={product.product_id.toString()}
                  name={product.product_name}
                  price={Number(product.price)}
                  image_path={product.image_path ?? '/artisans/amin-ybW2t0bEqm0-unsplash.jpg'}
                  showAddToCart={true}
                />
                <p className="text-sm text-gray-500 mt-1 text-center">
                  Sold by{' '}
                  <Link
                    href={`/shop/${product.seller_id}`}
                    className="text-blue-600 hover:underline"
                  >
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
