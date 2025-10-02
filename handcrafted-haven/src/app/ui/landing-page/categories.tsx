import {
  PaintBrushIcon,
  HomeModernIcon,
  RectangleGroupIcon,
  ShoppingBagIcon,
  StarIcon,
  TagIcon,
} from "@heroicons/react/16/solid";
import Link from "next/link";

const categories = [
  { name: "Jewellery", icon: ShoppingBagIcon },
  { name: "Art", icon: PaintBrushIcon },
  { name: "Home", icon: HomeModernIcon },
  { name: "Clothing", icon: TagIcon },
  { name: "Modern", icon: RectangleGroupIcon },
  { name: "Tendency", icon: StarIcon },
];

export default function Categories(){
    return(
        <div className="my-4">
        <h2 className="text-2xl font-bold text-center my-4">Our Categories</h2>
        <ul className="flex flex-row flex-wrap justify-center  gap-4 p-4 ">
          {categories.map((category) => (
            <Link key={category.name} href={`/category/${category.name}`}>
              <li
                className="flex flex-row items-center gap-3 bg-gray-50 hover:bg-gray-200 transition-colors duration-200 ease-in-out p-2 rounded-2xl"
              >
                <category.icon className="w-5 h-5 cursor-pointer" />
                {category.name}
              </li>
            </Link>
          ))}
        </ul>
      </div>
    )
}