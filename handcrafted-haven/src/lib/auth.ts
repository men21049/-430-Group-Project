// src/lib/auth.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export type CurrentUserPayload = {
  userId: string;
  role?: string;
  name?: string;
  email?: string;
};

export function getTokenFromRequest(req: Request): string | null {
  // Read cookie header and extract token cookie
  const cookie = req.headers.get("cookie") || "";
  const tokenPair = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="));
  if (!tokenPair) return null;
  return decodeURIComponent(tokenPair.split("=")[1] || "");
}

export function getCurrentUserFromRequest(req: Request): CurrentUserPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as CurrentUserPayload;
    return payload;
  } catch (err) {
    console.error("Invalid JWT:", err);
    return null;
  }
}
