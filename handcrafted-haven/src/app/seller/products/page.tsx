// src/app/seller/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/app/shop/ProductCard";
import Header from "@/app/ui/landing-page/header";

import CallToAction from "@/app/ui/landing-page/cta-section";
import WithAuth from "@/app/components/withAuth";

function SellerProductsContent() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch seller products
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/seller/products", {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to fetch products");
      }

      const data = await res.json();
      setProducts(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Delete product using /api/seller/products/[id] route
  const handleRemoveProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product?")) return;

    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 403) {
        alert("You are not allowed to remove this product.");
        return;
      }
      if (res.status === 404) {
        alert("Product not found.");
        await loadProducts();
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to remove product");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error("Remove error", err);
      alert(err?.message || "Failed to remove product");
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Products</h1>
          <button
            onClick={() => router.push("/seller/products/add")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition transform hover:scale-105 active:scale-95"
          >
            + Add Product
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading products...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">
            You haven’t added any products yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image_path={product.image || undefined}
                showAddToCart={false}
              >
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() =>
                      router.push(`/seller/products/edit/${product.id}`)
                    }
                    className="flex-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition transform hover:scale-105 active:scale-95"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveProduct(product.id)}
                    className="flex-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition transform hover:scale-95"
                  >
                    Delete
                  </button>
                </div>
              </ProductCard>
            ))}
          </ul>
        )}
      </div>
      <CallToAction />
    </>
  );
}

export default function SellerProductsPage() {
  return (
    <WithAuth role="SELLER">
      <SellerProductsContent />
    </WithAuth>
  );
}
