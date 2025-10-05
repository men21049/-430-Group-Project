import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, password, role, shopName, bio } = await req.json();

    if (!name || !email || !password) {
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

    // If seller, create seller profile
    if (role === "SELLER") {
      await prisma.seller.create({
        data: {
          shopName: shopName || `${name}'s Shop`,
          bio: bio || "",
          userId: user.id,
        },
      });
    }

    // If customer, create customer profile
    if (role === "CUSTOMER") {
      await prisma.customer.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ message: "User created successfully", user }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
