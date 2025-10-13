// src/app/shop/page.tsx
import prisma from "@/prisma/client";
import ProductCard from "./ProductCard"; // client component
import CTA from "@/app/ui/landing-page/cta-section";

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    include: { seller: { select: { id: true, shopName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Shop All Products</h1>

        {products.length === 0 ? (
          <p className="text-center text-gray-600 py-20">
            No products available. Please check back later.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image ?? "/artisans/amin-ybW2t0bEqm0-unsplash.jpg"}
                sellerName={product.seller?.shopName ?? "Unknown Seller"}
              />
            ))}
          </ul>
        )}
      </div>

      {/* ✅ CTA Section Added */}
      <section className="mt-16">
        <CTA />
      </section>
    </>
  );
}
