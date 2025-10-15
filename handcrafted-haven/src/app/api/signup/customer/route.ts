// src/app/api/signup/customer/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = connectDB;

    // Check if user already exists
    const existingUsers = await db`SELECT * FROM users WHERE email = ${email}`;
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer user
    const newUser = await db`
      INSERT INTO users (name, email, password, role, insert_dt, update_dt)
      VALUES (${name}, ${email}, ${hashedPassword}, 'CUSTOMER', NOW(), NOW())
      RETURNING user_id, name, email, role
    `;

    const user = newUser[0];

    return NextResponse.json(
      {
        message: "Customer account created successfully. Please log in to continue.",
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        redirectTo: "/login"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Customer signup error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
