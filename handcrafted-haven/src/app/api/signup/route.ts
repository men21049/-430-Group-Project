// src/app/api/signup/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, shopName, bio } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === "SELLER" ? "SELLER" : "CUSTOMER",
      },
    });

    // Create profile
    if (role === "SELLER") {
      await prisma.seller.create({
        data: {
          shopName: shopName || `${name}'s Shop`,
          bio: bio || "",
          userId: user.id,
        },
      });
    } else if (role === "CUSTOMER") {
      await prisma.customer.create({
        data: { userId: user.id },
      });
    }

    // Build JWT payload
    const payload = {
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    return NextResponse.json(
      {
        message: "Signup successful",
        token,
        role: user.role,
        userId: user.id,
        name: user.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
