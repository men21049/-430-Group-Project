import ProductCard from "@/app/ui/product-card";
import Header from "@/app/ui/landing-page/header";
import CallToAction from "@/app/ui/landing-page/cta-section";
import { getProductsFromDB } from "@/app/lib/data";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.query;

  let results: any[] = [];
  
  if (query) {
    try {
      const allProducts = await getProductsFromDB();
      results = allProducts.filter(
        (p: any) =>
          p.name
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          (p.description &&
            p.description
              .toLowerCase()
              .includes(query.toLowerCase()))
      );
    } catch (err) {
      console.error(err);
      results = [];
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto p-4 flex-1">
        <h1 className="text-2xl font-bold mb-4">
          Search Results for "{query || ''}"
        </h1>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p>No products found.</p>
        )}
      </main>
      <CallToAction />
    </div>
  );
}
