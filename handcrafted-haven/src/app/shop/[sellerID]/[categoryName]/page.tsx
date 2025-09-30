// handcrafted-haven\src\app\shop\[sellerID]\[categoryName]\page.tsx
import Header from '@/app/ui/landing-page/header';
import Footer from '@/app/ui/footer';
import ProductCard from '@/app/ui/product-card';
import Link from 'next/link';
import { getSellerProducts, getSellerName } from '@/app/lib/data';

export default async function CategoryPage({
  params,
}: {
  params: { sellerID: string; categoryName: string };
}) {
  const { sellerID, categoryName } = params;

  // Fetch all products for this seller
  const allProducts = await getSellerProducts(sellerID);

  // Filter by category
  const products = allProducts.filter(
    (p) => p.category.toLowerCase() === categoryName.toLowerCase()
  );

  const sellerName = getSellerName(sellerID);

  return (
    <div>
      <Header />

      <div className="max-w-7xl mx-auto p-4">
        {/* Back to seller shop link */}
        <Link
          href={`/shop/${sellerID}`}
          className="text-sm text-blue-600 hover:underline mb-2 inline-block"
        >
          &larr; Back to {sellerName}'s Shop
        </Link>

        <h1 className="text-2xl font-bold mb-4 capitalize">
          {categoryName} Products
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <p className="col-span-full text-center">
              No products found in this category.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
