// src/app/shop/seller/[sellerID]/[categoryName]/page.tsx
import ProductCard from '@/app/ui/product-card';
import Link from 'next/link';
import { getAllSellerProducts, getSellerInfo } from '@/app/lib/data';

type NormalizedProduct = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

export default async function SellerCategoryPage({
  params,
}: {
  params: { sellerID: string; categoryName: string };
}) {
  const { sellerID, categoryName } = params;

  // Fetch seller info
  const seller = await getSellerInfo(sellerID);
  const sellerName = (seller as any)?.name ?? 'Seller';

  // Fetch products filtered by seller
  const allProducts = await getAllSellerProducts(sellerID);

  // Normalize products to match ProductCard props
  const products: NormalizedProduct[] = allProducts
    .filter((p: any) => p.category?.toLowerCase() === categoryName.toLowerCase())
    .map((p: any) => ({
      id: String(p.id),
      name: p.name ?? p.title ?? 'Untitled',
      price: p.price,
      image: p.image ?? undefined,
    }));

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
            <ProductCard key={p.id} product={p} />
          ))
        ) : (
          <p className="col-span-full text-center">No products found in this category.</p>
        )}
      </div>
    </div>
  );
}
