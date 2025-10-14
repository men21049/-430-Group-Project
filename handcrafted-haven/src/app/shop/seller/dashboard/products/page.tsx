"use client";

import WithAuth from "@/app/components/withAuth";
import ProductsList from "./products-list";

function ProductsPageContent() {
  return (
    <div className="p-5">
      <h1 className="text-lg font-bold my-4">Products On Sale</h1>
      <ProductsList />
    </div>
  );
}

export default function ProtectedProductsPage() {
  return (
    <WithAuth role="SELLER">
      <ProductsPageContent />
    </WithAuth>
  );
}
