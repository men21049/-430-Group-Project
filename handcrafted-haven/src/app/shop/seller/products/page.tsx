"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WithAuth from "@/app/components/withAuth";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

function SellerProductsPageContent() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/products", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">My Products</h1>
      <button
        onClick={() => router.push("/seller/products/add")}
        className="bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        + Add Product
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(p => (
            <li key={p.id} className="border p-3 rounded shadow flex flex-col gap-2">
              {p.image && <img src={p.image} className="h-28 w-full object-cover rounded" />}
              <h2 className="font-semibold">{p.name}</h2>
              <p className="text-orange-500 font-bold">${p.price}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => router.push(`/seller/products/edit/${p.id}`)}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("Delete this product?")) return;
                    await fetch(`/api/seller/products?id=${p.id}`, { method: "DELETE", credentials: "include" });
                    loadProducts();
                  }}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProtectedSellerProductsPage() {
  return (
    <WithAuth role="SELLER">
      <SellerProductsPageContent />
    </WithAuth>
  );
}
