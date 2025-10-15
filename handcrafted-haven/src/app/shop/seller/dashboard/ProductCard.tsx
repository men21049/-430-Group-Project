// src/app/shop/seller/dashboard/ProductCard.tsx
"use client";

import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
}

export default function ProductCard({ id, name, price, description, image }: ProductCardProps) {
  return (
    <div className="border rounded p-2 shadow hover:shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95 max-w-xs">
      {image && (
        <img
          src={image}
          alt={name}
          className="h-28 w-full object-cover mb-2 rounded"
        />
      )}
      <h2 className="font-semibold">{name}</h2>
      <p className="text-orange-500 font-semibold">${price.toFixed(2)}</p>
      {description && <p className="text-sm line-clamp-2">{description}</p>}
      <div className="flex gap-2 mt-2">
        <Link href={`/seller/dashboard/manage/update/${id}`}>
          <button className="flex-1 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 active:scale-95 transition-transform duration-150">
            Edit
          </button>
        </Link>
        <button
          onClick={() => alert(`Delete ${name}`)}
          className="flex-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 active:scale-95 transition-transform duration-150"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
