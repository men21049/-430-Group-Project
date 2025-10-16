// src/scripts/reset-users.mjs
import postgres from "postgres";
import bcrypt from "bcrypt";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL no está definida en las variables de entorno");
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  ssl: "require",
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

async function main() {
  console.log("Deleting all users...");
  await sql`DELETE FROM users`;
  console.log("All users deleted.");

  // Optionally, create a test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const newUser = await sql`
    INSERT INTO users (name, email, password, role, insert_dt, update_dt)
    VALUES ('Test Seller', 'seller@example.com', ${hashedPassword}, 'SELLER', NOW(), NOW())
    RETURNING *
  `;

  // Create seller profile
  const newSeller = await sql`
    INSERT INTO sellers (seller_name, seller_type, isactive, insert_dt, update_dt)
    VALUES ('Test Shop', 1, true, NOW(), NOW())
    RETURNING *
  `;

  console.log("Created new user:", newUser[0]);
  console.log("Created new seller:", newSeller[0]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await sql.end();
  });
