import connectDB from "./database";

export const getSellerProducts = async (sellerId: string) => {
  const db = connectDB;
  return db`
    SELECT 
      product_id as id,
      product_name as name,
      price,
      category,
      image_path as image,
      seller_id as sellerId,
      insert_dt as createdAt
    FROM products
    WHERE seller_id = ${sellerId} AND isactive = true
    ORDER BY insert_dt DESC
  `;
};

export const addProduct = async (data: {
  name: string;
  price: number;
  category?: string;
  image?: string;
  sellerId: string;
}) => {
  const db = connectDB;
  const newProduct = await db`
    INSERT INTO products (
      product_name, price, category, image_path, seller_id, isactive, insert_dt, update_dt
    )
    VALUES (
      ${data.name}, ${data.price}, ${data.category || null}, ${data.image || null}, 
      ${data.sellerId}, true, NOW(), NOW()
    )
    RETURNING *
  `;
  return newProduct[0];
};

export const removeProduct = async (id: string) => {
  const db = connectDB;
  await db`
    UPDATE products 
    SET isactive = false, update_dt = NOW() 
    WHERE product_id = ${id}
  `;
  return { id };
};
