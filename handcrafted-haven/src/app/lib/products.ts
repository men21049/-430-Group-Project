import prisma from "./prisma";

export const getSellerProducts = async (sellerId: string) => {
  return prisma.product.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
  });
};

export const addProduct = async (data: {
  name: string;
  price: number;
  category?: string;
  image?: string;
  sellerId: string;
}) => {
  return prisma.product.create({ data });
};

export const removeProduct = async (id: string) => {
  return prisma.product.delete({ where: { id } });
};
