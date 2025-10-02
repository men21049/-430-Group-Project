import { Product } from "./definitions";

// Example static sellers data
const allSellers = [
  { id: "seller1", name: "Alice’s Art", logo: "/sellers/alice-logo.png", banner: "/sellers/alice-banner.jpg", bio: "Alice creates beautiful art pieces." },
  { id: "seller2", name: "Bob’s Crafts", logo: "/sellers/bob-logo.png", banner: "/sellers/bob-banner.jpg", bio: "Bob crafts unique handmade items." },
  // Add more sellers as needed
];

// Helper to get seller name by ID
export function getSellerName(sellerId: string) {
  return allSellers.find(s => s.id === sellerId)?.name || "Unknown Seller";
}

// Get full seller info
export async function getSellerInfo(sellerId: string) {
  return allSellers.find(s => s.id === sellerId) || { name: "Unknown Seller", logo: "", banner: "", bio: "" };
}

// Get all products for a specific seller
export async function getSellerProducts(sellerId: string) {
  return allProducts.filter(p => p.sellerId === sellerId);
}

// Global product list
const allProducts: Product[] = [
  {
    id: "1",
    name: "Handmade Necklace",
    price: 25,
    image: "/products/necklace.jpg",
    sellerId: "seller1",
    category: "Jewellery",
    description: "Beautiful handcrafted necklace."
  },
  {
    id: "2",
    name: "Wooden Bowl",
    price: 40,
    image: "/products/bowl.jpg",
    sellerId: "seller2",
    category: "Home",
    description: "Hand-carved wooden bowl."
  },
  {
    id: "3",
    name: "Painted Canvas",
    price: 100,
    image: "/products/canvas.jpg",
    sellerId: "seller1",
    category: "Art",
    description: "Original painted canvas."
  },
  // Add more products as needed
];

// Function to search globally by name or category
export async function searchProducts(query: string) {
  const q = query.toLowerCase();
  return allProducts.filter(
    p => p.name.toLowerCase().includes(q) || (p.category?.toLowerCase().includes(q))
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
