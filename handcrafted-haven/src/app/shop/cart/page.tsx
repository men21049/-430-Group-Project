// src/app/shop/cart/page.tsx  (server component)
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUserFromHeaders } from "@/lib/auth";
import CartContent from "@/app/shop/cart/CartContent";

/**
 * Server page that will never render for unauthenticated users.
 * We make this async and await headers() to satisfy environments where
 * headers() is typed as returning a Promise<ReadonlyHeaders>.
 */
export default async function CartPage() {
  // await headers() in case it's a Promise in your TS config/runtime
  const hdrs = await Promise.resolve(headers());

  // provide a minimal "Headers-like" object with get(name) => string | null
  // so getCurrentUserFromHeaders can read cookies/authorization consistently.
  const headerLike = {
    get: (name: string) => {
      // ReadableHeaders.get may return string | null | undefined depending on env
      try {
        const v = (hdrs as any).get?.(name);
        return typeof v === "string" ? v : v ?? null;
      } catch {
        // fallback safe behavior
        return null;
      }
    },
  };

  const user = getCurrentUserFromHeaders(headerLike);

  // Allow customers, sellers and admins to view cart (they can all buy).
  const allowed = ["CUSTOMER", "SELLER", "ADMIN"];

  if (!user || !user.role || !allowed.includes(String(user.role).toUpperCase())) {
    // server-side redirect -> page will not render at all for unauthenticated users
    redirect("/login");
  }

  // OK: authenticated (or role allowed) — render client cart content
  return <CartContent />;
}
