// simple nav items component for seller dashboard
import Link from "next/link";
import React from "react";

export default function NavItems() {
  return (
    <nav className="space-y-1">
      <Link href="/shop/seller/dashboard" className="block px-3 py-2 rounded hover:bg-gray-100">Overview</Link>
      <Link href="/shop/seller/dashboard/products" className="block px-3 py-2 rounded hover:bg-gray-100">Products</Link>
      <Link href="/shop/seller/dashboard/sales" className="block px-3 py-2 rounded hover:bg-gray-100">Sales</Link>
      <Link href="/shop/seller/dashboard/orders" className="block px-3 py-2 rounded hover:bg-gray-100">Orders</Link>
    </nav>
  );
}
