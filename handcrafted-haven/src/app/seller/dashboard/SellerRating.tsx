'use client';
import { useEffect, useState } from 'react';

export default function SellerRating() {
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    async function fetchRating() {
      try {
        const res = await fetch('/api/seller/rating');
        if (res.ok) {
          const data = await res.json();
          setRating(data.average);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchRating();
  }, []);

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-2">Seller Rating</h3>
      {rating !== null ? (
        <p className="text-2xl font-bold text-yellow-500">{rating.toFixed(1)} ★</p>
      ) : (
        <p>Loading rating...</p>
      )}
    </div>
  );
}
