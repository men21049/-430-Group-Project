// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getCurrentUserFromHeaders } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    // Return limited user info
    return NextResponse.json({
      user: {
        userId: user.userId,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
