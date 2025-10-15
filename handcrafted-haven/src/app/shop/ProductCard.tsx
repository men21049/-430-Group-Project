"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/app/context/CartContext";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  image_path?: string;
  sellerName?: string;
  showAddToCart?: boolean;
  children?: React.ReactNode; // For seller buttons like Edit/Delete
};

export default function ProductCard({
  id,
  name,
  price,
  image_path,
  sellerName,
  showAddToCart = true,
  children,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = async (e?: React.MouseEvent) => {
    e?.stopPropagation(); // prevent navigating if wrapped in link

    try {
      // Call addItem with the expected shape
      await addItem({ productId: id, quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("Failed to add to cart. See console for details.");
    }
  };

  return (
    <li className="border rounded-lg p-3 flex flex-col hover:shadow-lg transition transform hover:scale-105">
      <Link href={`/product/${id}`} className="flex-1">
        <div className="relative w-full h-60 rounded-lg bg-gray-100 mb-2">
          {image_path ? (
            <Image
              src={image_path}
              alt={name}
              fill
              className="object-contain rounded"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
        </div>

        <h3 className="font-semibold text-lg mb-1">{name}</h3>
        {sellerName && <p className="text-sm text-gray-500 mb-1">{sellerName}</p>}
        <p className="font-bold text-orange-500">${price}</p>
      </Link>

      {showAddToCart && (
        <button
          onClick={handleAdd}
          className={`mt-2 px-2 py-1 rounded w-full transition transform ${
            added
              ? "bg-green-700 text-white scale-105"
              : "bg-orange-500 text-white hover:bg-orange-600 hover:scale-105"
          }`}
        >
          {added ? "Added ✓" : "Add to Cart"}
        </button>
      )}

      {children && <div className="mt-2 flex gap-2">{children}</div>}
    </li>
  );
}
