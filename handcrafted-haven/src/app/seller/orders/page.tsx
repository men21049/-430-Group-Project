// src/app/seller/orders/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import WithAuth from "@/app/components/withAuth";
import Header from "@/app/ui/landing-page/header";
import Footer from "@/app/ui/footer";
import CallToAction from "@/app/ui/landing-page/cta-section";

export default function SellerOrdersWrapper() {
  return (
    <WithAuth role="SELLER">
      <SellerOrdersPage />
    </WithAuth>
  );
}

function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/seller/orders", { credentials: "include" });
        if (!res.ok) {
          console.error("Failed to load orders", res.status);
          setOrders([]);
          return;
        }
        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        console.error(err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Orders / Invoices</h1>
        {loading ? <p>Loading orders...</p> : null}
        {!loading && (!orders || orders.length === 0) && <p>No orders found yet.</p>}
        <div className="space-y-4">
          {orders?.map((o) => (
            <div key={o.id} className="p-4 border rounded">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-semibold">Order {o.id}</div>
                  <div className="text-sm text-gray-500">Placed: {new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${o.total?.toFixed?.(2) ?? "0.00"}</div>
                  <div className="text-sm text-gray-500">{o.status}</div>
                </div>
              </div>

              <ul className="mt-2 divide-y">
                {o.items?.map((it: any) => (
                  <li key={it.id} className="py-2 flex justify-between">
                    <div>
                      <div className="font-medium">{it.product?.name}</div>
                      <div className="text-sm text-gray-500">Qty: {it.quantity} • ${it.price.toFixed(2)}</div>
                    </div>
                    <div className="text-sm font-semibold">${(it.price * it.quantity).toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <CallToAction />
      <Footer />
    </>
  );
}
