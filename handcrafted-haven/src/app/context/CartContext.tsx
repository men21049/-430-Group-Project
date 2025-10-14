// handcrafted-haven\src\app\context\CartContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type CartItem = {
  id: string;
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

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  // --- local storage load (safe parse)
  const loadLocalCart = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("cart_local");
      if (!stored) {
        setItems([]);
        return;
      }
      const parsed = JSON.parse(stored) as CartItem[] | null;
      if (Array.isArray(parsed)) setItems(parsed);
      else setItems([]);
    } catch (err) {
      console.error("Failed to parse local cart:", err);
      setItems([]);
    }
  }, []);

  // --- server cart loader
  const loadCartFromServer = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (!res.ok) {
        // preserve existing client state if unauthorized, otherwise clear
        if (res.status === 401) {
          setItems([]);
          return;
        }
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error("loadCartFromServer error:", err);
      setItems([]);
    }
  }, []);

  const loadCart = useCallback(async () => {
    if (isAuthenticated) {
      await loadCartFromServer();
    } else {
      loadLocalCart();
    }
  }, [isAuthenticated, loadCartFromServer, loadLocalCart]);

  // --- detect auth on mount
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          setIsAuthenticated(true);
          await loadCartFromServer();
        } else {
          setIsAuthenticated(false);
          loadLocalCart();
        }
      } catch (err) {
        console.error("auth check failed:", err);
        setIsAuthenticated(false);
        loadLocalCart();
      }
    }
    init();
    // We intentionally do not include loadCartFromServer/loadLocalCart in deps to only run once at mount.
    // They are stable via useCallback above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist local cart whenever items change *and* user is a guest
  useEffect(() => {
    if (isAuthenticated === false && typeof window !== "undefined") {
      try {
        localStorage.setItem("cart_local", JSON.stringify(items));
      } catch (err) {
        console.error("Failed saving local cart:", err);
      }
    }
  }, [items, isAuthenticated]);

  // helper to update local guest items functionally + persist
  const saveLocal = (updater: (prev: CartItem[]) => CartItem[] | CartItem[]) => {
    setItems((prev) => {
      const next = typeof updater === "function" ? (updater as (p: CartItem[]) => CartItem[])(prev) : updater;
      try {
        localStorage.setItem("cart_local", JSON.stringify(next));
      } catch (err) {
        console.error("Failed to write cart_local:", err);
      }
      return next;
    });
  };

  // update item: unified handler
  const updateItem = async (id: string, action: "increment" | "decrement" | "remove") => {
    if (isAuthenticated) {
      // optimistic local update for faster UI
      setItems((prev) =>
        prev.map((it) => {
          if (it.id !== id) return it;
          if (action === "increment") return { ...it, quantity: it.quantity + 1 };
          if (action === "decrement") return { ...it, quantity: Math.max(1, it.quantity - 1) };
          // remove: filter later by returning same (we'll remove after)
          return it;
        })
      );
      if (action === "remove") {
        setItems((prev) => prev.filter((it) => it.id !== id));
      }

      const urlMap: Record<string, string> = {
        increment: "/api/cart/increment",
        decrement: "/api/cart/decrement",
        remove: "/api/cart/remove",
      };

      try {
        const res = await fetch(`${urlMap[action]}?id=${encodeURIComponent(id)}`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          // server failed — re-sync from server
          await loadCartFromServer();
        } else {
          // success — optionally reconcile using server GET (usually unnecessary)
          // but to keep consistent with server truth, fetch once:
          await loadCartFromServer();
        }
      } catch (err) {
        console.error("updateItem (server) error:", err);
        await loadCartFromServer();
      }
    } else {
      // guest flow — functional update + persist
      saveLocal((prev) => {
        const cur = [...prev];
        const idx = cur.findIndex((i) => i.id === id);
        if (idx === -1) return cur;
        if (action === "increment") cur[idx] = { ...cur[idx], quantity: cur[idx].quantity + 1 };
        if (action === "decrement") cur[idx] = { ...cur[idx], quantity: Math.max(1, cur[idx].quantity - 1) };
        if (action === "remove") cur.splice(idx, 1);
        return cur;
      });
    }
  };

  const increment = async (id: string) => updateItem(id, "increment");
  const decrement = async (id: string) => updateItem(id, "decrement");
  const removeItem = async (id: string) => updateItem(id, "remove");

  // add item
  const addItem = async (item: AddItemInput) => {
    const productId = item.productId ?? item.id;
    const quantity = Math.max(1, item.quantity ?? 1);
    if (!productId) return;

    if (isAuthenticated) {
      try {
        const res = await fetch("/api/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId, quantity }),
        });
        if (!res.ok) {
          console.error("Failed to add item (server)", await res.text());
          await loadCartFromServer();
          return;
        }
        const data = await res.json();
        // server returns the created/updated item in `item`
        const serverItem = data?.item;
        if (serverItem) {
          setItems((prev) => {
            // if existing item (by id), replace; if same product exists, replace that
            const existingIdx = prev.findIndex((p) => p.productId === serverItem.productId || p.id === serverItem.id);
            if (existingIdx !== -1) {
              const next = [...prev];
              next[existingIdx] = {
                id: serverItem.id,
                productId: serverItem.productId,
                name: serverItem.name,
                price: serverItem.price,
                quantity: serverItem.quantity,
                image: serverItem.image ?? null,
              };
              return next;
            }
            // add
            return [
              ...prev,
              {
                id: serverItem.id,
                productId: serverItem.productId,
                name: serverItem.name,
                price: serverItem.price,
                quantity: serverItem.quantity,
                image: serverItem.image ?? null,
              },
            ];
          });
        } else {
          // fallback: reload
          await loadCartFromServer();
        }
      } catch (err) {
        console.error("addItem server error:", err);
        await loadCartFromServer();
      }
    } else {
      // guest: functional update + persist
      saveLocal((prev) => {
        const cur = [...prev];
        const existing = cur.find((i) => i.productId === productId);
        if (existing) {
          existing.quantity += quantity;
          return cur;
        }
        const newItem: CartItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          productId,
          name: "Product",
          price: 0,
          quantity,
          image: null,
        };
        cur.push(newItem);
        return cur;
      });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      // immediate clear for UI feedback
      setItems([]);
      try {
        const res = await fetch("/api/cart/clear", { method: "POST", credentials: "include" });
        if (!res.ok) {
          console.error("Failed to clear server cart:", await res.text());
          await loadCartFromServer();
        }
      } catch (err) {
        console.error("clearCart error:", err);
        await loadCartFromServer();
      }
    } else {
      saveLocal(() => []);
    }
  };

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
