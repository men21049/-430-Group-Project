'use client';
import { useState, useEffect } from 'react';
import ProductCard from '@/app/ui/product-card';
import { searchProducts } from '@/app/lib/data';

export default function SearchPage({ searchParams }: { searchParams: { query?: string } }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function fetchResults() {
      if (searchParams.query) {
        const res = await searchProducts(searchParams.query);
        setResults(res);
      } else {
        setResults([]);
      }
    }
    fetchResults();
  }, [searchParams.query]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Search Results for "{searchParams.query}"
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.length > 0 ? (
          results.map(product => <ProductCard key={product.id} product={product} />)
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
}
