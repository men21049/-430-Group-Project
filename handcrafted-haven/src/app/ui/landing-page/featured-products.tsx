import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/lib/definitions";
import { getFakeProducts } from "@/app/lib/data";

export default async function FeaturedProducts() {
  const products = await getFakeProducts();

  return (
    <div>
      <h2 className="text-2xl font-bold text-center my-4">Featured Products</h2>
      <div className="flex flex-row items-center justify-center max-w-300 m-[auto]">
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-rows-[auto] gap-4 p-4 ">
          {products.map((product: Product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <li className="flex flex-col h-full gap-3 m-4">
                <span className="relative w-full h-20 py-4 rounded-lg bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain "
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw)"
                  />
                </span>
                <div className="break-words">
                  <h3>{product.title}</h3>
                  <p className={`font-bold font-arial`}>${product.price}</p>
                </div>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}
