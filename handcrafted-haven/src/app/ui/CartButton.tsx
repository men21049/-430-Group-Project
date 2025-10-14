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

  // show badge only when authenticated and positive items — your CartContext already handles that
  const showBadge = totalItems > 0 && !disabled;

  return (
    <button
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        onClick?.();
      }}
      aria-label="Open cart"
      className={clsx(
        "relative inline-flex items-center justify-center p-2 rounded transition",
        disabled ? "bg-gray-50 cursor-not-allowed text-gray-400" : "hover:bg-gray-100"
      )}
      disabled={disabled}
      title={disabled ? "Please sign in to access your cart" : "Open cart"}
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
