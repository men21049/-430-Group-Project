// src/app/ui/landing-page/categories.tsx
import {
  PaintBrushIcon,
  HomeModernIcon,
  RectangleGroupIcon,
  ShoppingBagIcon,
  StarIcon,
  TagIcon,
} from "@heroicons/react/16/solid";
import { Category } from "@/app/lib/definitions";
import Link from "next/link";


const categoryNames = ["Jewellery", "Art", "Home", "Clothing", "Modern", "Tendency"];
const categoryIcons = [ShoppingBagIcon, PaintBrushIcon, HomeModernIcon, TagIcon, RectangleGroupIcon, StarIcon];

const allCategories: Category[] = categoryNames.map((name, index) => ({
  name,
  icon: categoryIcons[index]
}));

export default function Categories() {
  return (
    <section className="my-10">
      <h2 className="text-2xl font-bold text-center mb-6">Our Categories</h2>
      <div className="flex flex-wrap justify-center gap-4 p-4">
        {allCategories.map((category) => (
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
