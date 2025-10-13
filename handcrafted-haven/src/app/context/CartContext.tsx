"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  id: string; // cartItem id or generated local id
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
};

export type AddItemInput = { productId?: string; id?: string; quantity?: number };

export type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isAuthenticated: boolean | null;
  loadCart: () => Promise<void>;
  addItem: (item: AddItemInput) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  increment: (id: string) => Promise<void>;
  decrement: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<{ ok: boolean; orderId?: string; error?: string }>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);
  const totalPrice = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          setIsAuthenticated(true);
          await migrateLocalCartToServer();
          await loadCartFromServer();
        } else {
          setIsAuthenticated(false);
          loadLocalCart();
        }
      } catch {
        setIsAuthenticated(false);
        loadLocalCart();
      }
    }
    init();
  }, []);

  const loadLocalCart = () => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("cart_local") : null;
    setItems(stored ? JSON.parse(stored) : []);
  };

  const loadCartFromServer = async () => {
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) setIsAuthenticated(false);
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Failed to load server cart:", err);
      setItems([]);
    }
  };

  const loadCart = async () => {
    if (isAuthenticated) await loadCartFromServer();
    else loadLocalCart();
  };

  const migrateLocalCartToServer = async () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("cart_local");
    if (!stored) return;
    const localItems: CartItem[] = JSON.parse(stored);
    if (!Array.isArray(localItems) || localItems.length === 0) return;

    for (const li of localItems) {
      if (!li.productId) continue;
      try {
        await fetch("/api/cart/add", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: li.productId, quantity: li.quantity }),
        });
      } catch (err) {
        console.warn("Failed to migrate local cart item", li, err);
      }
    }
    localStorage.removeItem("cart_local");
  };

  const addItemLocal = async (productId: string, quantity: number, opts?: Partial<CartItem>) => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("cart_local") : null;
    const cur: CartItem[] = stored ? JSON.parse(stored) : [];
    const existing = cur.find((c) => c.productId === productId);
    if (existing) existing.quantity += quantity;
    else
      cur.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        productId,
        name: opts?.name ?? "Product",
        price: opts?.price ?? 0,
        quantity,
        image: opts?.image ?? null,
      });
    localStorage.setItem("cart_local", JSON.stringify(cur));
    setItems(cur);
  };

  const addItem = async (item: AddItemInput) => {
    const productId = item.productId ?? item.id;
    const quantity = Math.max(1, item.quantity || 1);
    if (!productId) throw new Error("addItem requires productId");

    if (isAuthenticated === null) {
      const cur = [...items];
      const existing = cur.find((i) => i.productId === productId);
      if (existing) existing.quantity += quantity;
      else cur.push({ id: `${Date.now()}-${Math.random()}`, productId, name: "Product", price: 0, quantity });
      setItems(cur);
      return;
    }

    if (isAuthenticated) {
      try {
        const res = await fetch("/api/cart/add", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          if (res.status === 401) setIsAuthenticated(false);
          throw new Error(j?.error || "Add item failed");
        }
        await loadCartFromServer();
      } catch {
        await addItemLocal(productId, quantity);
      }
    } else {
      await addItemLocal(productId, quantity);
    }
  };

  const removeItem = async (id: string) => {
    if (isAuthenticated) {
      try {
        const res = await fetch(`/api/cart/remove?id=${encodeURIComponent(id)}`, {
          method: "POST",
          credentials: "include",
        });
        if (res.status === 401) setIsAuthenticated(false);
        await loadCartFromServer();
      } catch (err) {
        console.error("Remove failed:", err);
      }
    } else {
      const cur = items.filter((i) => i.id !== id);
      setItems(cur);
      localStorage.setItem("cart_local", JSON.stringify(cur));
    }
  };

  const increment = async (id: string) => {
    if (isAuthenticated) {
      try {
        const res = await fetch(`/api/cart/increment?id=${encodeURIComponent(id)}`, {
          method: "POST",
          credentials: "include",
        });
        if (res.status === 401) setIsAuthenticated(false);
        await loadCartFromServer();
      } catch (err) {
        console.error("Increment failed:", err);
      }
    } else {
      const cur = items.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
      setItems(cur);
      localStorage.setItem("cart_local", JSON.stringify(cur));
    }
  };

  const decrement = async (id: string) => {
    if (isAuthenticated) {
      try {
        const res = await fetch(`/api/cart/decrement?id=${encodeURIComponent(id)}`, {
          method: "POST",
          credentials: "include",
        });
        if (res.status === 401) setIsAuthenticated(false);
        await loadCartFromServer();
      } catch (err) {
        console.error("Decrement failed:", err);
      }
    } else {
      const cur = items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i));
      setItems(cur);
      localStorage.setItem("cart_local", JSON.stringify(cur));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await fetch("/api/cart/clear", { method: "POST", credentials: "include" });
        setItems([]);
      } catch {
        setItems([]);
      }
    } else {
      setItems([]);
      localStorage.removeItem("cart_local");
    }
  };

  const checkout = async (): Promise<{ ok: boolean; orderId?: string; error?: string }> => {
    if (!isAuthenticated) return { ok: false, error: "Not authenticated" };
    try {
      const res = await fetch("/api/checkout", { method: "POST", credentials: "include" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (res.status === 401) setIsAuthenticated(false);
        return { ok: false, error: json?.error || "Checkout failed" };
      }
      const json = await res.json();
      await loadCartFromServer();
      return { ok: true, orderId: json.orderId };
    } catch (err: any) {
      console.error("Checkout error:", err);
      return { ok: false, error: String(err?.message ?? err) };
    }
  };

  const value: CartContextValue = {
    items,
    totalItems,
    totalPrice,
    isAuthenticated,
    loadCart,
    addItem,
    removeItem,
    increment,
    decrement,
    clearCart,
    checkout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
