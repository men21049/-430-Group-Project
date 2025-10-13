// src/app/ui/landing-page/featured-products.tsx
import Link from "next/link";
import Image from "next/image";
import prisma from "@/app/lib/prisma"; // your Prisma client
import { Product } from "@/app/lib/definitions";

export default async function FeaturedProducts() {
  // Fetch products from the database
  const dbProducts = await prisma.product.findMany({
    take: 10, // maximum 10 products
  });

  // Map database results to match your Product type
  const products: Product[] = dbProducts.map((p) => ({
    id: p.id,
    title: p.name ?? "Untitled Product",
    price: p.price ?? 0,
    category: p.category ?? "",
    description: p.description ?? "",
    image: p.image ?? undefined,
    rating: {
      rate: p.ratingRate ?? 0,
      count: p.ratingCount ?? 0,
    },
  }));

  // Randomize order
  const shuffledProducts = products.sort(() => Math.random() - 0.5);

  return (
    <div>
      <h2 className="text-3xl font-bold text-center my-6">Featured Products</h2>
      <div className="flex flex-row items-center justify-center max-w-[1200px] mx-auto">
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
          {shuffledProducts.map((product: Product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <li className="flex flex-col h-full gap-4 m-2 bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <span className="relative w-full h-40 rounded-lg bg-gray-100">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.title || "Product Image"}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </span>
                <div className="break-words">
                  <h3 className="text-lg font-semibold">{product.title}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600">{product.description}</p>
                  )}
                  <p className="font-bold text-lg">${product.price}</p>
                  <p className="text-sm text-yellow-600">
                    ⭐ {product.rating.rate.toFixed(1)} ({product.rating.count})
                  </p>
                </div>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}
