import connectDB from "./database";

export const getSellerProducts = async (sellerId: string) => {
  const db = connectDB;
  return await db`
    SELECT 
      product_id as id,
      product_name as name,
      price,
      description,
      category,
      image_path as image,
      seller_id,
      insert_dt as created_at
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
  return await db`
    INSERT INTO products (product_name, price, category, image_path, seller_id, isactive, stock, description, insert_dt, update_dt)
    VALUES (${data.name}, ${data.price}, ${data.category || null}, ${data.image || null}, ${data.sellerId}, true, 0, '', NOW(), NOW())
    RETURNING *
  `;
};

export const removeProduct = async (id: string) => {
  const db = connectDB;
  return await db`
    UPDATE products 
    SET isactive = false, update_dt = NOW()
    WHERE product_id = ${id}
    RETURNING *
  `;
};
