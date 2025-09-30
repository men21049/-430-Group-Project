import Header from '@/app/ui/landing-page/header';
import Footer from '@/app/ui/footer';
import ProductCard from '@/app/ui/product-card';
import { getFakeProducts } from '@/app/lib/data';

export default async function CategoryPage({ params }: { params: { categoryName: string } }) {
  const { categoryName } = params;

  // Fetch all products (or from your API)
  const allProducts = await getFakeProducts();

  // Filter products by category
  const products = allProducts.filter(
    (p) => p.category.toLowerCase() === categoryName.toLowerCase()
  );

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 capitalize">{categoryName} Products</h1>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p>No products found in this category.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
