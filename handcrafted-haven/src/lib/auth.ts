// src/lib/auth.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export type CurrentUserPayload = {
  userId?: string;
  role?: string;
  name?: string;
  email?: string;
  // any other fields you put into the token
};

/**
 * Read token from cookie string (cookie header) or Authorization header.
 */
export function getTokenFromCookieHeader(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  // look for token=... (URL encoded)
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
 * Accepts a Headers-like object (Next's Headers / ReadonlyHeaders, or anything with .get())
 */
export function getCurrentUserFromHeaders(
  headers: { get(name: string): string | null } | Headers | Record<string, string | undefined>
): CurrentUserPayload | null {
  try {
    // unify header retrieval
    let cookieHeader: string | null | undefined;
    let authHeader: string | null | undefined;

    if (typeof (headers as any).get === "function") {
      cookieHeader = (headers as any).get("cookie");
      authHeader = (headers as any).get("authorization") || (headers as any).get("Authorization");
    } else {
      // plain object
      cookieHeader = (headers as any)["cookie"] ?? (headers as any)["Cookie"];
      authHeader = (headers as any)["authorization"] ?? (headers as any)["Authorization"];
    }

    // 1) check Authorization: Bearer <token>
    if (authHeader && typeof authHeader === "string") {
      const parts = authHeader.split(" ");
      if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
        const token = parts[1];
        try {
          const payload = jwt.verify(token, JWT_SECRET) as CurrentUserPayload;
          return payload;
        } catch (e) {
          // continue to cookie fallback
          console.debug("JWT verify failed on Authorization header:", (e as Error).message);
        }
      }
    }

    // 2) cookie token fallback
    const token = getTokenFromCookieHeader(cookieHeader);
    if (!token) return null;

    try {
      const payload = jwt.verify(token, JWT_SECRET) as CurrentUserPayload;
      return payload;
    } catch (err) {
      console.debug("JWT verify failed on cookie token:", (err as Error).message);
      return null;
    }
  } catch (err) {
    console.error("getCurrentUserFromHeaders error:", err);
    return null;
  }
}
