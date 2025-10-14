"use client";

import WithAuth from "@/app/components/withAuth";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import ProductCard from "@/app/shop/seller/dashboard/ProductCard"; // keep your existing ProductCard component

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
};

function DashboardContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sellerId = Cookies.get("userId");

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
    if (res.ok) setProducts(products.filter(p => p.id !== id));
  };

  useEffect(() => {
    async function fetchProducts() {
      if (!sellerId) return;
      try {
        const res = await fetch(`/api/seller/products?userId=${sellerId}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [sellerId]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Shop</h1>

      <Link href="/seller/products/add">
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 active:scale-95 transition-transform duration-150 mb-4">
          Add New Product
        </button>
      </Link>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(p => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              image={p.image}
              showAddToCart={false} // seller view
            >
              <Link href={`/seller/dashboard/manage/update/${p.id}`}>
                <button className="flex-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Edit
                </button>
              </Link>
              <button
                onClick={() => handleDelete(p.id)}
                className="flex-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </ProductCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProtectedDashboardPage() {
  return (
    <WithAuth role="SELLER">
      <DashboardContent />
    </WithAuth>
  );
}
