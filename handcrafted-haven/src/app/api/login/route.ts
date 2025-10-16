// src/app/api/login/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Missing email or password" }, { status: 400 });

    const db = connectDB;
    const users = await db`SELECT * FROM users WHERE email = ${email}`;
    
    if (users.length === 0) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    // create JWT
    const payload = { userId: user.user_id, role: user.role, name: user.name, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    return NextResponse.json({ message: "Login successful", token, user: { id: user.user_id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
