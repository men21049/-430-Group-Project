'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/app/ui/landing-page/header';
import Footer from '@/app/ui/footer';
import ShopBanner from '@/app/ui/shop-banner';
import ProductCard from '@/app/ui/product-card';
import { getSellerInfo, getSellerProducts } from '@/app/lib/data';

export default function ShopPage() {
  const { sellerId } = useParams();

  const [seller, setSeller] = useState({ name: '', logo: '', banner: '', bio: '' });
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Example categories for seller
  const categories = ["Jewellery", "Art", "Home", "Clothing", "Modern", "Tendency"];

  useEffect(() => {
    async function fetchData() {
      const info = await getSellerInfo(sellerId);
      const items = await getSellerProducts(sellerId);
      setSeller(info);
      setProducts(items);
      setFiltered(items);
    }
    fetchData();
  }, [sellerId]);

  const handleSearch = (query: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const q = query.toLowerCase();
      setFiltered(products.filter(p => p.name.toLowerCase().includes(q)));
    }, 300); // debounce 300ms
  };

  return (
    <div>
      <Header />
      <ShopBanner seller={seller} />

      <div className="max-w-7xl mx-auto p-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search this shop..."
          className="w-full p-2 border rounded mb-4"
          onChange={e => handleSearch(e.target.value)}
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
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center col-span-full mt-4">No products found.</p>
        )}
      </div>

      <Footer />
    </div>
  );
}
