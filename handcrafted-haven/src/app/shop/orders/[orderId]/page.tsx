'use client';
import React, { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PayButton from '@/app/shop/orders/PayButton';
import CTASection from '@/app/ui/landing-page/cta-section'; // ✅ import CTA

type OrderItem = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  items: OrderItem[];
  customer: { name: string; email: string };
};

type Props = { params: { orderId: string } };

export default function OrderDetail({ params }: Props) {
  const { orderId } = params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          if (res.status === 404) return notFound();
          throw new Error(`Failed to fetch order: ${res.status}`);
        }
        const data: Order = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) return <p>Loading order...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <>
      <div className="p-4 max-w-3xl mx-auto">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/">Home</Link> / <Link href="/shop/orders">Orders</Link> /{' '}
          <span>Order #{order.id}</span>
        </nav>

        <h1 className="text-2xl font-bold mb-3">Order #{order.id}</h1>
        <p className="text-sm text-gray-500">
          Date: {new Date(order.createdAt).toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">Status: {order.status}</p>
        <p className="text-lg font-semibold mt-2 mb-4">
          Total: ${order.total.toFixed(2)}
        </p>

        <h2 className="text-xl font-semibold mb-2">Items</h2>
        {order.items.length === 0 ? (
          <p>No items in this order.</p>
        ) : (
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex gap-2">
          <a
            href={`/api/orders/${order.id}/invoice`}
            target="_blank"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download Invoice (PDF)
          </a>

          <PayButton
            orderId={order.id}
            status={order.status}
            after={() => setOrder({ ...order, status: 'PAID' })}
          />
        </div>
      </div>
      {/* ✅ Continue Shopping Link Added */}
      <div className="mt-8 text-center">
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Continue Shopping
        </Link>
      </div>

      {/* ✅ CTA Section Added */}
      <section className="mt-16">
        <CTASection />
      </section>
    </>
  );
}
