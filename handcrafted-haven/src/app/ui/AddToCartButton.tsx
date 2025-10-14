"use client";

import { useCart } from "@/app/context/CartContext";
import { Product } from "@/app/lib/definitions";
import { useState } from "react";

interface AddToCartButtonProps {
  product: Product;
  size?: "small" | "medium" | "large";
  showMessage?: boolean;
}

export default function AddToCartButton({ 
  product, 
  size = "medium", 
  showMessage = true 
}: AddToCartButtonProps) {
  const { addItem, isAuthenticated } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    e.stopPropagation(); // Stop event bubbling
    
    if (isAdding) return;
    
    setIsAdding(true);
    setMessage(null);

    try {
      await addItem({
        productId: product.product_id.toString(),
        quantity: 1,
      });
      
      if (showMessage) {
        setMessage("¡Agregado!");
        setTimeout(() => setMessage(null), 2000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (showMessage) {
        setMessage("Error");
        setTimeout(() => setMessage(null), 2000);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const sizeClasses = {
    small: "py-1 px-2 text-xs",
    medium: "py-2 px-3 text-sm",
    large: "py-2 px-4 text-base"
  };

  if (isAuthenticated === false) {
    return (
      <button 
        className={`${sizeClasses[size]} bg-gray-400 text-white rounded cursor-not-allowed`}
        disabled
        title="Login to add to cart"
      >
        Login Required
      </button>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={handleAddToCart}
        disabled={isAdding}
        className={`${sizeClasses[size]} rounded transition ${
          isAdding 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-[#FF8C42] hover:bg-[#584b53]"
        } text-white font-medium`}
        title="Add to Cart"
      >
        {isAdding ? "..." : "Add to Cart"}
      </button>
      
      {showMessage && message && (
        <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs ${
          message.includes("Error") ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
