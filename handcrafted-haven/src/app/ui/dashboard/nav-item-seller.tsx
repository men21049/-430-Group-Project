<<<<<<< HEAD
"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ArrowTrendingUpIcon,
  CubeIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

const links = [
  {
    name: "Product",
    href: "/seller/dashboard/products",
    icon: CubeIcon,
  },
  { name: "Manage", 
    href: "/seller/dashboard/manage", 
    icon: PlusCircleIcon },
  {
    name: "Sales",
    href: "/seller/dashboard/sales",
    icon: ArrowTrendingUpIcon,
  },
];

export default function NavigationItems() {
  const pathname = usePathname();
  console.log(pathname);

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "p-4 w-full h-full flex flex-col gap-2 items-center justify-center rounded-md cursor-pointer hover:bg-[#F69D37] hover:text-white",
              pathname.includes(link.href) ? "bg-[#F69D37] text-white" : "bg-gray-100"
            )}
          >
            <LinkIcon className="w-6 h-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
=======
// simple nav items component for seller dashboard
import Link from "next/link";
import React from "react";

export default function NavItems() {
  return (
    <nav className="space-y-1">
      <Link href="/shop/seller/dashboard" className="block px-3 py-2 rounded hover:bg-gray-100">Overview</Link>
      <Link href="/shop/seller/dashboard/products" className="block px-3 py-2 rounded hover:bg-gray-100">Products</Link>
      <Link href="/shop/seller/dashboard/sales" className="block px-3 py-2 rounded hover:bg-gray-100">Sales</Link>
      <Link href="/shop/seller/dashboard/orders" className="block px-3 py-2 rounded hover:bg-gray-100">Orders</Link>
    </nav>
>>>>>>> d56f8fa33e8290ebf0687d86059b4b72d4daa6c4
  );
}
