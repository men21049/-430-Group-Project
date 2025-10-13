// src/app/ui/landing-page/categories.tsx
import {
  PaintBrushIcon,
  HomeModernIcon,
  RectangleGroupIcon,
  ShoppingBagIcon,
  StarIcon,
  TagIcon,
} from "@heroicons/react/16/solid";
import Link from "next/link";
import prisma from "@/prisma/client";

interface Category {
  name: string;
  icon: any;
}

const allCategories: Category[] = [
  { name: "Jewellery", icon: ShoppingBagIcon },
  { name: "Art", icon: PaintBrushIcon },
  { name: "Home", icon: HomeModernIcon },
  { name: "Clothing", icon: TagIcon },
  { name: "Modern", icon: RectangleGroupIcon },
  { name: "Tendency", icon: StarIcon },
];

export default async function Categories() {
  // Fetch distinct categories from products table
  const productCategories = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  const availableCategories = allCategories.filter((cat) =>
    productCategories.some(
      (p) => p.category?.toLowerCase() === cat.name.toLowerCase()
    )
  );

  if (availableCategories.length === 0) return null; // hide if no products

  return (
    <section className="my-10">
      <h2 className="text-2xl font-bold text-center mb-6">Our Categories</h2>
      <div className="flex flex-wrap justify-center gap-4 p-4">
        {availableCategories.map((category) => (
          <Link
            key={category.name}
            href={`/shop/category/${category.name.toLowerCase()}`}
            className="flex items-center gap-3 bg-gray-50 hover:bg-amber-100 p-3 rounded-2xl shadow-sm transition-colors duration-200"
          >
            <category.icon className="w-5 h-5 text-amber-600" />
            <span className="text-gray-700 font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
