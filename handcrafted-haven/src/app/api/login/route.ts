// src/app/api/login/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Missing email or password" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    // create JWT
    const payload = { userId: user.id, role: user.role, name: user.name, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    return NextResponse.json({ message: "Login successful", token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
