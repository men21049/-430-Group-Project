"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  HomeIcon,
  UserIcon,
  ShoppingBagIcon,
  PlusCircleIcon,
  // LogoutIcon removed; replaced with a button
} from "@heroicons/react/24/outline";

type NavLink = {
  name: string;
  href?: string;
  icon?: React.ElementType;
  onClick?: () => void;
};

export default function NavLinks() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(Cookies.get("role") || null);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("name");
    setRole(null);
    router.push("/login");
  };

  // Guest links (not logged in)
  const guestLinks: NavLink[] = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Login", href: "/login", icon: UserIcon },
    { name: "Sign Up Customer", href: "/signup/customer", icon: UserIcon },
    { name: "Sign Up Seller", href: "/signup/seller", icon: UserIcon },
  ];

  // Customer links
  const customerLinks: NavLink[] = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "My Account", href: "/account", icon: UserIcon },
    { name: "Shop Products", href: "/shop", icon: ShoppingBagIcon },
    { name: "Logout", onClick: handleLogout },
  ];

  // Seller links
  const sellerLinks: NavLink[] = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "My Shop", href: "/seller/dashboard", icon: UserIcon },
    { name: "Add Product", href: "/seller/products/add", icon: PlusCircleIcon },
    { name: "Logout", onClick: handleLogout },
  ];

  const links = role === "SELLER" ? sellerLinks : role === "CUSTOMER" ? customerLinks : guestLinks;

  return (
    <div className="flex flex-col gap-2 w-full">
      {links.map((link) =>
        link.href ? (
          <Link key={link.name} href={link.href} className="flex gap-2 items-center justify-center hover:bg-gray-100 active:bg-gray-200 p-2 rounded-md">
            {link.icon && <link.icon className="w-5 h-5" />} {link.name}
          </Link>
        ) : (
          <button
            key={link.name}
            onClick={link.onClick}
            className="flex gap-2 items-center justify-center hover:bg-gray-100 active:bg-gray-200 p-2 rounded-md w-full"
          >
            {link.icon && <link.icon className="w-5 h-5" />} {link.name}
          </button>
        )
      )}
    </div>
  );
}
