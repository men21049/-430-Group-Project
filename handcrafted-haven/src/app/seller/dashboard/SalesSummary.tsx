// handcrafted-haven/src/app/seller/dashboard/SalesSummary.tsx
"use client";

import { useEffect, useState } from "react";

type SalesSummaryType = {
  totalRevenue: number;
  totalOrders: number;
  perProduct: { productId: string; name: string; revenue: number; qty: number }[];
  rating?: number | null;
};

export default function SalesSummary({ sellerId }: { sellerId?: string }) {
  const [summary, setSummary] = useState<SalesSummaryType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // pass sellerId as query param if provided
        const url = sellerId ? `/api/seller/sales?sellerId=${sellerId}` : `/api/seller/sales`;
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error("Failed sales fetch");
        const data = await res.json();

        // fetch rating
        let rating = null;
        if (sellerId) {
          try {
            const r = await fetch(`/api/seller/rating?sellerId=${sellerId}`);
            if (r.ok) {
              const rd = await r.json();
              rating = rd.rating ?? null;
            }
          } catch (e) {
            console.error("Failed to fetch rating", e);
          }
        }

        setSummary({ ...data, rating });
      } catch (err) {
        console.error(err);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sellerId]);

  if (loading) return <div>Loading sales...</div>;
  if (!summary) return <div>No sales data available.</div>;

  return (
    <div className="p-4 border rounded">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Sales Summary</h3>
        {summary.rating != null && (
          <div className="text-yellow-500 font-bold">{summary.rating.toFixed(1)} ★</div>
        )}
      </div>

      <div className="flex gap-4">
        <div>
          <div className="text-sm text-gray-500">Total Orders</div>
          <div className="text-2xl font-bold">{summary.totalOrders}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold">${summary.totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      <h4 className="mt-4 font-semibold">Top products</h4>
      <ul className="mt-2 space-y-2">
        {summary.perProduct.map((p) => (
          <li key={p.productId} className="flex justify-between">
            <span>{p.name} × {p.qty}</span>
            <span className="font-semibold">${p.revenue.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
