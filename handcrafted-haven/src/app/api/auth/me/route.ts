// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import connectDB from "@/app/lib/database";


/**
 * Returns the current user payload (decoded JWT) and minimal DB user info.
 * Accepts token via Authorization header or cookie (token|authToken|access_token).
 */
export async function GET(req: Request) {
  try {
    console.log("🔍 /api/auth/me - Headers:", req.headers.get("cookie"));
    const payload = getCurrentUserFromRequest(req);
    console.log("🔍 /api/auth/me - Payload:", payload);
    if (!payload?.userId) {
      console.log("🔍 /api/auth/me - No payload or userId, returning 401");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // optional: include DB user info (email, role, isAdmin) if you want
    const db = connectDB;
    const users = await db`
      SELECT user_id as id, name, email, role 
      FROM users 
      WHERE user_id = ${payload.userId}
    `;
    const user = users.length > 0 ? users[0] : null;

    return NextResponse.json({
      ok: true,
      payload,
      user: user ?? null,
    });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
