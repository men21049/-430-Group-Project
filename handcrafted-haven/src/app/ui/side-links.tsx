import { HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

//Add more links here!!! It automatically includes them to the sidebar
const links = [{ name: "Home", href: "/", icon: HomeIcon }];

export default function NavLinks() {
  return (
    <ul className="flex flex-col gap-4 my-4">
      {links.map((link) => (
        <Link key={link.name} href={link.href}>
          <li
            className="flex gap-2 items-center justify-center hover:bg-gray-100 active:bg-gray-200 p-2 rounded-md   transition-colors duration-200 ease-in-out"
          >
              <link.icon className="w-5 h-5 cursor-pointer" />
            {link.name}
          </li>
        </Link>
      ))}
    </ul>
  );
}
