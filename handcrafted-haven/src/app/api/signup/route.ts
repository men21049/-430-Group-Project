import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
export async function POST(req: Request) {
    try {
        const { name, email, password, role} = await req.json();
        if (!name || !email || !password || !role) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }   
        const db = connectDB;
        const existingUsers = await db`SELECT * FROM users WHERE email = ${email}`;
        if (existingUsers.length > 0) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
        }   
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db`
        INSERT INTO users (name, email, password, role, insert_dt)
        VALUES (${name}, ${email}, ${hashedPassword}, ${role}, current_timestamp)
        RETURNING user_id, name, email, role
        `;
        const newUser = result[0];
        const payload = { userId: newUser.user_id, role: newUser.role, name: newUser.name, email: newUser.email };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
        return NextResponse.json({ message: "User created successfully", token, role: newUser.role, userId: newUser.user_id, name: newUser.name });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }   
}