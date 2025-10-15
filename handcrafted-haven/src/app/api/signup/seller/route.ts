// src/app/api/signup/seller/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  try {
    const { name, email, password, shopName, bio } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = connectDB;

    // Check if user already exists
    const existingUsers = await db`SELECT * FROM users WHERE email = ${email}`;
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      
      // If user exists and is already a SELLER, check if they have a seller profile
      if (existingUser.role === 'SELLER') {
        // Check if seller profile exists - look for any seller profile associated with this user
        // Since we don't have a direct user_id link in sellers table, we'll check if there's a seller
        // with a name that matches the user's name or if they already have a seller profile
        const existingSellers = await db`
          SELECT * FROM sellers 
          WHERE seller_name LIKE ${`%${existingUser.name}%`} 
          OR seller_name = ${shopName || `${existingUser.name}'s Shop`}
        `;
        
        if (existingSellers.length > 0) {
          return NextResponse.json({ error: "You are already a seller! Welcome back!" }, { status: 409 });
        } else {
          // User exists as SELLER but no seller profile, create it
          const newSeller = await db`
            INSERT INTO sellers (seller_name, seller_type, isactive, insert_dt, update_dt)
            VALUES (${shopName || `${existingUser.name}'s Shop`}, 1, true, NOW(), NOW())
            RETURNING *
          `;
          
          const seller = newSeller[0];
          
          // Build JWT payload for auto-login
          const payload = {
            userId: existingUser.user_id,
            role: existingUser.role,
            name: existingUser.name,
            email: existingUser.email,
          };
          
          const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
          
          return NextResponse.json(
            {
              message: "Now you are a seller, Welcome!",
              token,
              user: {
                id: existingUser.user_id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
              },
              seller: {
                id: seller.seller_id,
                name: seller.seller_name,
                type: seller.seller_type,
                isactive: seller.isactive,
              },
              redirectTo: "/seller/dashboard"
            },
            { status: 201 }
          );
        }
      } else {
        return NextResponse.json({ error: "Email already registered with different role" }, { status: 409 });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create seller user
    const newUser = await db`
      INSERT INTO users (name, email, password, role, insert_dt, update_dt)
      VALUES (${name}, ${email}, ${hashedPassword}, 'SELLER', NOW(), NOW())
      RETURNING *
    `;

    const user = newUser[0];

    // Create seller profile in sellers table
    const newSeller = await db`
      INSERT INTO sellers (seller_name, seller_type, isactive, insert_dt, update_dt)
      VALUES (${shopName || `${name}'s Shop`}, 1, true, NOW(), NOW())
      RETURNING *
    `;

    const seller = newSeller[0];

    // Build JWT payload for auto-login
    const payload = {
      userId: user.user_id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    return NextResponse.json(
      {
        message: "Seller account created successfully. Logging in...",
        token,
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        seller: {
          id: seller.seller_id,
          name: seller.seller_name,
          type: seller.seller_type,
          isactive: seller.isactive,
        },
        redirectTo: "/seller/dashboard"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Seller signup error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
