"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import Header from "@/app/ui/landing-page/header";
import Footer from "@/app/ui/footer";
import ShopBanner from "@/app/ui/shop-banner";
import ProductCard from "@/app/ui/product-card";
import { getSellerInfo, getSellerProducts } from "@/app/lib/data";

export default function ShopPage() {
  const router = useRouter();
  const { sellerId } = useParams();
  const [seller, setSeller] = useState({ name: "", logo: "", banner: "", bio: "" });
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout>();

  // 🧭 Example categories
  const categories = ["Jewellery", "Art", "Home", "Clothing", "Modern", "Tendency"];

  // 👤 Get current user info from cookies
  const currentUserRole = Cookies.get("role");
  const currentUserId = Cookies.get("id");

  useEffect(() => {
    async function fetchData() {
      const info = await getSellerInfo(sellerId as string);
      const items = await getSellerProducts(sellerId as string);

      // ✅ Fix: ensure images exist and have correct path
      const productsWithImages = items.map((p: any) => ({
        ...p,
        image: p.image?.startsWith("/") ? p.image : `/products/${p.image || "default.jpg"}`,
      }));

      setSeller(info);
      setProducts(productsWithImages);
      setFiltered(productsWithImages);
    }

    fetchData();
  }, [sellerId]);

  // 🔍 Search debounce
  const handleSearch = (query: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const q = query.toLowerCase();
      setFiltered(products.filter((p) => p.name.toLowerCase().includes(q)));
    }, 300);
  };

  // 🧱 Corrected Add Product redirect
  const handleAddProduct = () => {
    router.push("/seller/products"); // ✅ Correct URL
  };

  return (
    <div>
      <Header />
      <ShopBanner seller={seller} />

      <div className="max-w-7xl mx-auto p-4">
        {/* Header with Add Product */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{seller.name}'s Shop</h1>
          {currentUserRole === "seller" && currentUserId === sellerId && (
            <button
              onClick={handleAddProduct}
              className="bg-[#FF8C42] text-white px-4 py-2 rounded hover:bg-[#ff7b1f] transition-all transform hover:scale-105 active:scale-95"
            >
              + Add Product
            </button>
          )}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search this shop..."
          className="w-full p-2 border rounded mb-4"
          onChange={(e) => handleSearch(e.target.value)}
        />

        {/* Categories */}
        <div className="my-6">
          <h2 className="text-xl font-semibold mb-2">Categories</h2>
          <ul className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <li key={category}>
                <Link
                  href={`/shop/${sellerId}/${category.toLowerCase()}`}
                  className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Products */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-8">
            No products found.{" "}
            {currentUserRole === "seller" && currentUserId === sellerId && (
              <span
                onClick={handleAddProduct}
                className="text-[#FF8C42] cursor-pointer underline hover:text-[#e9772c]"
              >
                Add your first product
              </span>
            )}
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}
