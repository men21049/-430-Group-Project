// src/scripts/reset-users.mjs
import prisma from "../prisma/client.js"; // <- points to src/prisma/client.ts compiled to JS

async function main() {
  console.log("Deleting all users...");
  await prisma.user.deleteMany({});
  console.log("All users deleted.");

  // Optionally, create a test user
  const newUser = await prisma.user.create({
    data: {
      name: "Test Seller",
      email: "seller@example.com",
      password: "password123",
      role: "SELLER",
      sellerProfile: {
        create: {
          shopName: "Test Shop",
          bio: "This is a test shop",
        },
      },
    },
  });

  console.log("Created new user + seller:", newUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
