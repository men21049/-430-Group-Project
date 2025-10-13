// src/app/ui/CartButton.tsx
"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import clsx from "clsx";

export default function CartButton({
  onClick,
  disabled = false,
}: {
  onClick?: () => void;
  disabled?: boolean;
}) {
  const { totalItems } = useCart();

  const showBadge = totalItems > 0;

  return (
    <button
      onClick={() => onClick?.()}
      aria-label="Open cart"
      className={clsx(
        "relative inline-flex items-center justify-center p-2 rounded transition",
        disabled ? "bg-gray-50 text-gray-400" : "hover:bg-gray-100"
      )}
      title={disabled ? "Please sign in to access certain features" : "Open cart"}
      type="button"
    >
      <ShoppingCart size={22} />
      {showBadge && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  );
}
