"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/ui/landing-page/header";
import Footer from "@/app/ui/footer";
import CallToAction from "@/app/ui/landing-page/cta-section";
import ProductGrid from "@/app/ui/product-grid";

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  category?: string | null;
};

export default function SellerProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Fetch products from backend
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/seller/products", {
        method: "GET",
        credentials: "include", // ensure cookies (token) are sent
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch products");
      }
      const data = await res.json();

      const formattedItems = (data || []).map((p: any) => ({
        ...p,
        image: p.image?.startsWith("/")
          ? p.image
          : `/artisans/${p.image || "amin-ybW2t0bEqm0-unsplash.jpg"}`,
      }));

      setProducts(formattedItems);
    } catch (err: any) {
      console.error("Error loading products:", err);
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // re-load when refreshKey changes (after add/delete)
  }, [refreshKey]);

  const handleAddProduct = () => router.push("/seller/products/add");

  const handleRemoveProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product?")) return;

    try {
      const res = await fetch(`/api/seller/products?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        // trigger reload
        setRefreshKey((k) => k + 1);
      } else {
        const txt = await res.text();
        console.error("Failed to remove product:", txt);
        alert("Failed to remove product");
      }
    } catch (err) {
      console.error("Error removing product:", err);
      alert("Failed to remove product");
    }
  };

  return (
    <div>
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Products</h1>

          <div className="flex gap-3">
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition transform hover:scale-105 active:scale-95"
              title="Refresh list"
            >
              Refresh
            </button>

            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition transform hover:scale-105 active:scale-95"
            >
              + Add Product
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading products…</div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={loadProducts}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="mb-4">You haven’t added any products yet.</p>
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition transform hover:scale-105"
            >
              Add your first product
            </button>
          </div>
        ) : (
          <ProductGrid
            products={products}
            title="All My Listings"
            emptyMessage="You haven’t added any products yet."
            onRemove={handleRemoveProduct}
          />
        )}
      </div>

      <CallToAction />
      <Footer />
    </div>
  );
}
