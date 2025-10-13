// src/app/seller/products/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/ui/landing-page/header";

import CallToAction from "@/app/ui/landing-page/cta-section";
import WithAuth from "@/app/components/withAuth";

interface Product {
  id: string;
  name: string;
  price: number;
  category?: string | null;
  image?: string | null;
  stock?: number | null;
}

function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState<number | "">("");
  const [image, setImage] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/seller/products/${productId}`, {
          credentials: "include",
        });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to fetch product");
        }
        const data: Product = await res.json();
        setProduct(data);
        setName(data.name);
        setPrice(data.price);
        setCategory(data.category || "");
        setStock(data.stock ?? 0);
        setImage(data.image || "");
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, router]);

  const handleSave = async () => {
    if (!name || price === "") {
      alert("Name and price are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, price, category, stock, image }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to update product");
      }

      alert("Product updated successfully!");
      router.push("/seller/products");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading product...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!product) return <p className="text-center mt-10">Product not found.</p>;

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">
          Edit Product
        </h1>

        {/* Basic Info */}
        <section className="p-6 rounded-lg shadow-md bg-indigo-50 border-l-4 border-indigo-600 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-3 text-indigo-700">
            Basic Info
          </h2>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col text-gray-800">
              Product Name <span className="text-red-500">*</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </label>

            <label className="flex flex-col text-gray-800">
              Category
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </label>
          </div>
        </section>

        {/* Pricing */}
        <section className="p-6 rounded-lg shadow-md bg-green-50 border-l-4 border-green-600 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-3 text-green-700">Pricing</h2>
          <label className="flex flex-col text-gray-800">
            Price <span className="text-red-500">*</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              min={0}
              step={0.01}
            />
          </label>
        </section>

        {/* Inventory */}
        <section className="p-6 rounded-lg shadow-md bg-yellow-50 border-l-4 border-yellow-500 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-3 text-yellow-700">
            Inventory
          </h2>
          <label className="flex flex-col text-gray-800">
            Stock
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              min={0}
            />
          </label>
        </section>

        {/* Media */}
        <section className="p-6 rounded-lg shadow-md bg-indigo-50 border-l-4 border-indigo-600 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-3 text-indigo-700">Media</h2>
          <label className="flex flex-col text-gray-800">
            Image URL
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="https://example.com/image.jpg"
            />
          </label>
          {image && (
            <div className="mt-3">
              <p className="text-sm text-gray-800">Preview:</p>
              <img
                src={image}
                alt="Product preview"
                className="h-40 object-contain mt-2 border rounded-lg"
              />
            </div>
          )}
        </section>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={() => router.push("/seller/products")}
            className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition shadow-md"
          >
            Cancel
          </button>
        </div>
      </div>
      <CallToAction />
    </>
  );
}

export default function EditProductPageWrapper() {
  return (
    <WithAuth role="SELLER">
      <EditProductPage />
    </WithAuth>
  );
}
