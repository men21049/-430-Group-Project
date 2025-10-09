import { Product } from "./definitions";

// Example static sellers data
const allSellers = [
  { id: "seller1", name: "Alice’s Art", logo: "/sellers/alice-logo.png", banner: "/sellers/alice-banner.jpg", bio: "Alice creates beautiful art pieces." },
  { id: "seller2", name: "Bob’s Crafts", logo: "/sellers/bob-logo.png", banner: "/sellers/bob-banner.jpg", bio: "Bob crafts unique handmade items." },
  // Add more sellers as needed
];

//Fecthing the results and then filtering, is not usually a good practice since it affects performance. Instead, fetch the data using sql filtering. But for testing is fine.

// Helper to get seller name by ID
export function getSellerName(sellerId: string) {
  return allSellers.find(s => s.id === sellerId)?.name || "Unknown Seller";
}

// Get full seller info
export async function getSellerInfo(sellerId: string) {
  return allSellers.find(s => s.id === sellerId) || { name: "Unknown Seller", logo: "", banner: "", bio: "" };
}

// Get all products for a specific seller
export async function getAllSellerProducts(sellerId: string) {
  return allProducts.filter(p => p.sellerId === sellerId);
}

// Get a specific product by ID
export async function getProductById(productId: number) {
  return allProducts.find(p => p.id === productId);
}

// Get all active products for a specific seller
export async function getSellerProducts(sellerId: string) {
  return allProducts.filter(p => p.sellerId === sellerId && p.active);
}

// Global product list
const allProducts: Product[] = [
  {
    id: 1,
    name: "Handmade Necklace",
    price: 24.95,
    image: "/products/necklace.jpg",
    sellerId: "seller1",
    category: ["Jewellery"],
    description: "Beautiful handcrafted necklace.",
    active: true,
    rating: {
      rate: 4.5,
      count: 10
    }
  },
  {
    id: 2,
    name: "Wooden Bowl",
    price: 40.00,
    image: "/products/bowl.jpg",
    sellerId: "seller2",
    category: ["Home"],
    description: "Hand-carved wooden bowl.",
    active: true,
    rating: {
      rate: 4.2,
      count: 8
    }
  },
  {
    id: 3,
    name: "Painted Canvas",
    price: 99.99,
    image: "/products/canvas.jpg",
    sellerId: "seller1",
    category: ["Art"],
    description: "Original painted canvas.",
    active: true,
    rating: {
      rate: 4.8,
      count: 12
    }
  },
  // Add more products as needed
];

// Function to search globally by name or category
export async function searchProducts(query: string) {
  const q = query.toLowerCase();
  return allProducts.filter(
    p => p.name.toLowerCase().includes(q) || (p.category?.map(c => c.toLowerCase()).includes(q) || p.description?.toLowerCase().includes(q)) //this works with category array and description.
  );
}

// Optional: fetch fake products from external API
export async function getFakeProducts() {
  try {
    const res = await fetch("https://fakestoreapi.com/products");
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const data: Product[] = await res.json();
    return data; // returns all API products
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data");
  }
}
