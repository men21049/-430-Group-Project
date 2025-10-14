// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";


/**
 * Returns the current user payload (decoded JWT) and minimal DB user info.
 * Accepts token via Authorization header or cookie (token|authToken|access_token).
 */
export async function GET(req: Request) {
  try {
    const payload = getCurrentUserFromRequest(req);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // optional: include DB user info (email, role, isAdmin) if you want
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, isAdmin: true },
    });

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
