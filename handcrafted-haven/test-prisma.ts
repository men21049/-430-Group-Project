import prisma from "./src/prisma/client";

async function test() {
  try {
    const items = await prisma.cartItem.findMany({
      include: { product: true, user: true },
    });
    console.log(items);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
