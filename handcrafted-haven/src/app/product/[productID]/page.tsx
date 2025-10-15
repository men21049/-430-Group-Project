import Header from "@/app/ui/landing-page/header";
import { Product } from "@/app/lib/definitions";
import { getProductFromDB } from "@/app/lib/data";
import Image from "next/image";
import AddToCartButton from "@/app/ui/AddToCartButton";

/*const prisma = new PrismaClient();*/

interface ProductPageProps {
  params: {
    productID: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
    try {
        const resolvedParams = await params;
        const product = await getProductFromDB(resolvedParams.productID);
        console.log(product);

        return (
          <div>
            <Header />
            <div className="w-full max-w-4xl mx-auto p-4">
              <Image
                src={product.image_path || "/artisans/fallback.jpg"}
                alt={product.product_name}
                width={250}
                height={250}
                className="rounded-lg object-cover"
              />
              <h1 className="text-3xl font-bold mb-2">{product.product_name}</h1>
              <p className="text-xl font-semibold mb-2">
                ${Number(product.price).toFixed(2)}
              </p>
              {product.category && (
                <p className="text-gray-500 mb-4">Category: {product.category}</p>
              )}
              {product.description && <p className="mb-4">{product.description}</p>}
              <AddToCartButton product={product} />
            </div>
          </div>
        );
    } catch (error) {
        console.error("Error loading product:", error);
        return (
          <div>
            <Header />
            <div className="max-w-7xl mx-auto p-4">
              <p>Product not found or error loading product.</p>
            </div>
          </div>
        );
    }
}
