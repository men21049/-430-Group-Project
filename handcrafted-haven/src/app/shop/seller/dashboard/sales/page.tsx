// handcrafted-haven/src/app/shop/seller/dashboard/sales/page.tsx
"use client";

import { useEffect, useState } from "react";
import WithAuth from "@/app/components/withAuth";
import Cookies from "js-cookie";

type Sale = {
  id: string;
  productName: string;
  quantity: number;
  total: number;
  date: string;
};

function SellerSalesContent() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const sellerId = Cookies.get("userId");

  useEffect(() => {
    async function fetchSales() {
      if (!sellerId) return;
      try {
        const res = await fetch(`/api/seller/sales?userId=${sellerId}`);
        if (!res.ok) throw new Error("Failed to fetch sales");
        const data = await res.json();
        setSales(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSales();
  }, [sellerId]);

  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalItems = sales.reduce((acc, s) => acc + s.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Sales</h1>
      {loading ? (
        <div>Loading sales...</div>
      ) : sales.length === 0 ? (
        <p>No sales yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="bg-gray-100 p-4 rounded">
            <p>Total Revenue: ${totalRevenue.toFixed(2)}</p>
            <p>Total Items Sold: {totalItems}</p>
          </div>
          <ul className="divide-y divide-gray-300">
            {sales.map((s) => (
              <li key={s.id} className="py-2 flex justify-between">
                <span>{s.productName}</span>
                <span>{s.quantity} pcs</span>
                <span>${s.total.toFixed(2)}</span>
                <span>{new Date(s.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ProtectedSellerSalesPage() {
  return (
    <WithAuth role="SELLER">
      <SellerSalesContent />
    </WithAuth>
  );
}
