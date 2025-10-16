'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PayButton from './orders/PayButton';

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
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders', { credentials: 'include' });
        if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
        const data: Order[] = await res.json();
        setOrders(data);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (orders.length === 0) return <p>No orders found.</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:underline">Home</Link> &nbsp;/&nbsp;
        <span>Orders</span>
      </nav>

      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {orders.map((order) => (
        <div key={order.id} className="border p-3 rounded mb-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-semibold">Order #{order.id}</p>
              <p className="text-sm text-gray-500">
                Date: {new Date(order.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Status: {order.status}</p>
            </div>

            <div className="flex gap-2 items-center">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total</div>
                <div className="font-bold">${order.total.toFixed(2)}</div>
              </div>

              <Link
                href={`/shop/orders/${order.id}`}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Invoice
              </Link>

              <PayButton
                orderId={order.id}
                status={order.status}
                after={() => {
                  setOrders((prev) =>
                    prev.map((o) =>
                      o.id === order.id ? { ...o, status: 'PAID' } : o
                    )
                  );
                }}
              />
            </div>
          </div>

          <ul className="text-sm mt-2 space-y-1">
            {order.items.map((item) => (
              <li key={item.id}>
                {item.name} × {item.quantity} — ${(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
