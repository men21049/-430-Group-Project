// src/app/shop/seller/[sellerID]/[categoryName]/page.tsx
import ProductCard from '@/app/ui/product-card';
import Link from 'next/link';
import { getSellerProductsByCategory, getSellerInfo } from '@/app/lib/data';

export default async function SellerCategoryPage({
  params,
}: {
  params: Promise<{ sellerID: string; categoryName: string }>;
}) {
  const { sellerID, categoryName } = await params;

  // Fetch seller info
  const seller = await getSellerInfo(sellerID);
  const sellerName = seller?.name ?? 'Seller';

  // Fetch products filtered by seller and category directly from DB
  const products = await getSellerProductsByCategory(sellerID, categoryName);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <Link
        href={`/shop/${sellerID}`}
        className="text-sm text-blue-600 hover:underline mb-2 inline-block"
      >
        &larr; Back to {sellerName}'s Shop
      </Link>

      <h1 className="text-2xl font-bold mb-4 capitalize">{categoryName} Products</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((p) => (
            <ProductCard 
              key={p.product_id} 
              product={{
                id: p.product_id.toString(),
                name: p.product_name,
                price: p.price,
                image: p.image_path
              }}
            />
          ))
        ) : (
          <p className="col-span-full text-center">No products found in this category.</p>
        )}
      </div>
    </div>
  );
}
