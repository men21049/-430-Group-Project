// src/scripts/reset-users.mjs
import postgres from "postgres";

const connectDB = postgres(process.env.DATABASE_URL, {
  ssl: "require",
});

async function main() {
  console.log("Deleting all users...");
  await connectDB`DELETE FROM users`;
  console.log("All users deleted.");

  // Optionally, create a test user
  const bcrypt = await import("bcrypt");
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const newUser = await connectDB`
    INSERT INTO users (name, email, password, role, insert_dt, update_dt)
    VALUES ('Test Seller', 'seller@example.com', ${hashedPassword}, 'SELLER', NOW(), NOW())
    RETURNING *
  `;

  // Create seller profile
  await connectDB`
    INSERT INTO sellers (seller_name, insert_dt, update_dt)
    VALUES ('Test Shop', NOW(), NOW())
  `;

  console.log("Created new user + seller:", newUser[0]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await connectDB.end();
  });
