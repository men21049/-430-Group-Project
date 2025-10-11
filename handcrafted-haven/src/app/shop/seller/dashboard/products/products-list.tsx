"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import WithAuth from "@/app/components/withAuth";
import ToggleSwitch from "@/app/ui/dashboard/toggle-switch";

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
};

function ProductsListContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const sellerId = Cookies.get("userId") || "";

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`/api/seller/products?sellerId=${sellerId}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    }
    if (sellerId) fetchProducts();
  }, [sellerId]);

  if (!products.length) return <p className="p-4">No products found.</p>;

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
      {products.map((product) => (
        <li
          key={product.id}
          className="flex flex-col gap-3 cursor-pointer p-2 border rounded-md shadow hover:shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          {product.image && (
            <div className="relative w-full h-60 rounded-lg bg-gray-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
          )}
          <div className="text-center">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-orange-500 font-bold">
              ${product.price.toFixed(2)}
            </p>
            {product.description && (
              <p className="text-sm line-clamp-2">{product.description}</p>
            )}
          </div>
          <div className="flex gap-2 justify-center mt-2">
            <Link href={`/shop/seller/dashboard/manage/update/${product.id}`}>
              <button className="flex-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 active:scale-95 transition-transform duration-150">
                Edit
              </button>
            </Link>
            <button className="flex-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 active:scale-95 transition-transform duration-150">
              Delete
            </button>
          </div>
          <div className="flex justify-center mt-2">
            <ToggleSwitch />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ProtectedProductsPage() {
  return (
    <WithAuth role="SELLER">
      <ProductsListContent />
    </WithAuth>
  );
}
