"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/app/shop/ProductCard";
import Header from "@/app/ui/landing-page/header";
import Footer from "@/app/ui/footer";
import CallToAction from "@/app/ui/landing-page/cta-section";
import WithAuth from "@/app/components/withAuth";

function SellerProductsContent() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/seller/products", { method: "GET", credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleRemoveProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product?")) return;
    try {
      const res = await fetch(`/api/seller/products?id=${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) setProducts(prev => prev.filter(p => p.id !== id));
      else alert("Failed to remove product");
    } catch { alert("Failed to remove product"); }
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

        {loading ? <p className="text-center text-gray-500">Loading products...</p> :
         error ? <p className="text-center text-red-600">{error}</p> :
         products.length === 0 ? <p className="text-center text-gray-500">You haven’t added any products yet.</p> :
         <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
           {products.map(product => (
             <ProductCard
               key={product.id}
               id={product.id}
               name={product.name}
               price={product.price}
               image={product.image || undefined}
               showAddToCart={false}
             >
               <div className="flex gap-2 mt-2">
                 <button
                   onClick={() => router.push(`/seller/products/edit/${product.id}`)}
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
        }
      </div>
      <CallToAction />
      <Footer />
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
