// src/lib/auth.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export type CurrentUserPayload = {
  userId?: string;
  role?: string; // will be normalized to UPPERCASE (e.g. "SELLER", "ADMIN", "CUSTOMER")
  name?: string;
  email?: string;
  // any other fields you put into the token
};

/**
 * Read token from cookie string (cookie header) or Authorization header.
 */
export function getTokenFromCookieHeader(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const tokenPair = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token=") || c.startsWith("authToken=") || c.startsWith("access_token="));
  if (tokenPair) {
    return decodeURIComponent(tokenPair.split("=")[1] || "");
  }
  return null;
}

/**
 * Normalize role to uppercase if present.
 */
function normalizePayloadRole(payload: CurrentUserPayload | null): CurrentUserPayload | null {
  if (!payload) return null;
  if (payload.role && typeof payload.role === "string") {
    payload.role = payload.role.toUpperCase();
  }
  return payload;
}

/**
 * Accepts a Headers-like object (Next's Headers / ReadonlyHeaders, or anything with .get())
 * Returns the token payload or null.
 */
export function getCurrentUserFromHeaders(
  headers: { get(name: string): string | null } | Headers | Record<string, string | undefined>
): CurrentUserPayload | null {
  try {
    let cookieHeader: string | null | undefined;
    let authHeader: string | null | undefined;

    if (typeof (headers as any).get === "function") {
      cookieHeader = (headers as any).get("cookie");
      authHeader = (headers as any).get("authorization") || (headers as any).get("Authorization");
    } else {
      cookieHeader = (headers as any)["cookie"] ?? (headers as any)["Cookie"];
      authHeader = (headers as any)["authorization"] ?? (headers as any)["Authorization"];
    }

    // 1) Authorization: Bearer <token>
    if (authHeader && typeof authHeader === "string") {
      const parts = authHeader.split(" ");
      if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
        const token = parts[1];
        try {
          const payload = jwt.verify(token, JWT_SECRET) as CurrentUserPayload;
          return normalizePayloadRole(payload);
        } catch (e) {
          console.debug("JWT verify failed on Authorization header:", (e as Error).message);
        }
      }
    }

    // 2) cookie token fallback
    const token = getTokenFromCookieHeader(cookieHeader);
    if (!token) return null;

    try {
      const payload = jwt.verify(token, JWT_SECRET) as CurrentUserPayload;
      return normalizePayloadRole(payload);
    } catch (err) {
      console.debug("JWT verify failed on cookie token:", (err as Error).message);
      return null;
    }
  } catch (err) {
    console.error("getCurrentUserFromHeaders error:", err);
    return null;
  }
}

/**
 * Accepts a Request object (server-side route). Wrapper around getCurrentUserFromHeaders.
 */
export function getCurrentUserFromRequest(req: Request): CurrentUserPayload | null {
  // req.headers is a Headers-like object in Next.js app routes
  return getCurrentUserFromHeaders((req as any).headers);
}

/**
 * Helper to check roles. `allowed` can be a single role or array of roles.
 */
export function hasRole(user: CurrentUserPayload | null, allowed: string | string[]): boolean {
  if (!user || !user.role) return false;
  const roles = Array.isArray(allowed) ? allowed : [allowed];
  return roles.map((r) => r.toUpperCase()).includes(user.role.toUpperCase());
}

/**
 * Convenience checks:
 */
export function isSeller(user: CurrentUserPayload | null) {
  return hasRole(user, "SELLER");
}
export function isAdmin(user: CurrentUserPayload | null) {
  return hasRole(user, "ADMIN");
}
export function isSellerOrAdmin(user: CurrentUserPayload | null) {
  return hasRole(user, ["SELLER", "ADMIN"]);
}
