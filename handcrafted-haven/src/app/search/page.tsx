'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/app/ui/product-card';
import Header from '@/app/ui/landing-page/header';
import Footer from '@/app/ui/footer';
import CallToAction from '@/app/ui/landing-page/cta-section';

export default function SearchPage({ searchParams }: { searchParams: { query?: string } }) {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    async function fetchResults() {
      if (searchParams.query) {
        try {
          const res = await fetch('/api/products');
          if (!res.ok) throw new Error('Failed to fetch products');
          const allProducts = await res.json();

          const filtered = allProducts.filter((p: any) =>
            p.name.toLowerCase().includes(searchParams.query!.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchParams.query!.toLowerCase()))
          );

          setResults(filtered);
        } catch (err) {
          console.error(err);
          setResults([]);
        }
      } else {
        setResults([]);
      }
    }
    fetchResults();
  }, [searchParams.query]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto p-4 flex-1">
        <h1 className="text-2xl font-bold mb-4">
          Search Results for "{searchParams.query}"
        </h1>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p>No products found.</p>
        )}
      </main>
      <CallToAction />
      <Footer />
    </div>
  );
}
