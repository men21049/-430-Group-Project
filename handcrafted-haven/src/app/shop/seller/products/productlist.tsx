// src/app/shop/seller/products/productlist.tsx
import Image from "next/image";
import Link from "next/link";
import connectDB from "@/app/lib/database";
import { getCurrentUser } from "@/lib/auth";
import WithAuth from "@/app/components/withAuth";

async function ProductsListContent() {
  const user = await getCurrentUser();
  if (!user?.userId)
    return <p className="text-red-600 text-center mt-8">Not authenticated.</p>;

  // Get the seller linked to this user
  const seller = const db = connectDB; await dbseller.findUnique({
    where: { userId: user.id },
    include: { products: true },
  });

  // Get the seller linked to this user
  const sellers = await db`
    SELECT seller_id, seller_name 
    FROM sellers 
    WHERE seller_name LIKE ${`%${user.name}%`}
  `;

  if (sellers.length === 0)
    return (
      <p className="text-red-600 text-center mt-8">
        No seller profile found for your account.
      </p>
    );

  const seller = sellers[0];

  // Get products for this seller
  const products = await db`
    SELECT 
      product_id as id,
      product_name as name,
      price,
      image_path as image
    FROM products
    WHERE seller_id = ${seller.seller_id} AND isactive = true
    ORDER BY insert_dt DESC
  `;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">
          Your Products ({products.length})
        </h2>
        <Link
          href="/shop/seller/products/add"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-600 text-center mt-6">
          You haven't added any products yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border p-3 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <div className="relative w-full h-48 bg-gray-50 rounded overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <h3 className="mt-3 font-semibold text-lg">{product.name}</h3>
              <p className="font-bold text-orange-500 mb-2">
                ${product.price.toFixed(2)}
              </p>

              <Link
                href={`/shop/seller/products/edit/${product.id}`}
                className="inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsList() {
  return (
    <WithAuth role="SELLER">
      <ProductsListContent />
    </WithAuth>
  );
}
