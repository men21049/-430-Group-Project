"use client";

import WithAuth from "@/app/components/withAuth";
import Orders from "@/app/shop/Orders";

function OrdersPageContent() {
  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Orders & Invoices</h1>
      <Orders />
    </main>
  );
}

export default function ProtectedOrdersPage() {
  return (
    <WithAuth role="CUSTOMER">
      <OrdersPageContent />
    </WithAuth>
  );
}
