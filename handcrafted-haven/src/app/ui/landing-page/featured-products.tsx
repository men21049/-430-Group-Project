import Link from "next/link";
import Image from "next/image";
import { Product } from "@/app/lib/definitions";
import { getProductsFromDB } from "@/app/lib/data";
import AddToCartButton from "@/app/ui/AddToCartButton";

export default async function FeaturedProducts() {
  
  // Obtener productos desde la base de datos
  const allProducts = await getProductsFromDB();
  
  // Tomar los primeros 8 productos como destacados
  const products = allProducts.slice(0, 8);
  return (
    <div>
      <h2 className="text-3xl font-bold text-center my-6">Featured Products</h2>
      <div className="flex flex-row items-center justify-center max-w-[1200px] mx-auto">
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
          {products.map((product: Product) => (
            <li key={product.product_id} className="flex flex-col h-full gap-4 m-2 bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
              <Link href={`/product/${product.product_id}`} className="flex flex-col h-full">
                <span className="relative w-full h-40 rounded-lg bg-gray-100">
                  {product.image_path ? (
                    <Image
                      src={product.image_path}
                      alt={product.product_name || "Product Image"}
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
                <div className="break-words flex-grow">
                  <h3 className="text-lg font-semibold">{product.product_name || "Untitled Product"}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600">{product.description}</p>
                  )}
                  <p className="font-bold text-lg">
                    {product.price !== null && product.price !== undefined
                      ? `$${product.price}`
                      : "Price not set"}
                  </p>
                </div>
              </Link>
              <div className="mt-auto">
                <AddToCartButton product={product} size="small" />
              </div>
            </li>
          ))} 
        </ul>
      </div>
    </div>
  );
}
