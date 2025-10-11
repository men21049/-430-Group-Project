// src/app/shop/[sellerID]/page.tsx
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
  const params = useParams() as Record<string, string | undefined>;
  // handle both sellerID and sellerId keys (route folder uses [sellerID])
  const sellerId = params.sellerID ?? params.sellerId ?? "";
  const [seller, setSeller] = useState({ name: "", logo: "", banner: "", bio: "" });
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const searchTimeout = useRef<number | NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔐 Read role & id from cookies, normalize role to uppercase
  const rawRole = Cookies.get("role");
  const currentUserRole = rawRole ? rawRole.toUpperCase() : null;
  const currentUserId = Cookies.get("id");

  // 🧭 Example categories (you can replace or fetch categories)
  const categories = ["Jewellery", "Art", "Home", "Clothing", "Modern", "Tendency"];

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        if (!sellerId) {
          setError("Invalid seller");
          setLoading(false);
          return;
        }

        const info = await getSellerInfo(sellerId);
        const items = await getSellerProducts(sellerId);

        // Normalize image paths (ensure leading slash)
        const productsWithImages = items.map((p: any) => ({
          ...p,
          image: p.image
            ? p.image.startsWith("/")
              ? p.image
              : `/${p.image}`
            : `/products/default.jpg`,
        }));

        if (!mounted) return;
        setSeller(info ?? { name: "", logo: "", banner: "", bio: "" });
        setProducts(productsWithImages);
        setFiltered(productsWithImages);
      } catch (err: any) {
        console.error("Failed to load seller data", err);
        if (mounted) setError(err?.message || "Failed to load seller");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => { mounted = false; if (searchTimeout.current) clearTimeout(searchTimeout.current as any); };
  }, [sellerId]);

  // 🔍 Search debounce (300ms)
  const handleSearch = (query: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current as any);
    searchTimeout.current = setTimeout(() => {
      const q = query.trim().toLowerCase();
      if (!q) {
        setFiltered(products);
        return;
      }
      setFiltered(products.filter((p) => (p.name || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)));
    }, 300);
  };

  // If logged-in user is the seller (case-insensitive role check), show Add Product button
  const isSellerViewingOwnShop = currentUserRole === "SELLER" && currentUserId === sellerId;

  const handleAddProduct = () => {
    // send sellers to their product management add page
    router.push("/seller/products/add");
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="max-w-7xl mx-auto p-4">
          <p className="text-center text-gray-500">Loading shop...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="max-w-7xl mx-auto p-4">
          <p className="text-center text-red-600">Error: {error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <ShopBanner seller={seller} />

      <div className="max-w-7xl mx-auto p-4">
        {/* Header with Add Product */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{seller.name || "Seller"}'s Shop</h1>
          {isSellerViewingOwnShop && (
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
                  href={`/shop/${sellerId}/${encodeURIComponent(category.toLowerCase())}`}
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
            {isSellerViewingOwnShop && (
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
