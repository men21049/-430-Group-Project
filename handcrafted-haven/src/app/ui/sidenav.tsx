"use client";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import clsx from "clsx";
import NavLinks from "./side-links";

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div>
      {/* Hamburger icon */}
      <span className="cursor-pointer  p-1">
        <Bars3Icon onClick={toggleMenu} className="w-6 h-6 hover:bg-gray-200" />
      </span>

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed inset-0 top-0 left-0 h-[100dvh] w-1/2 lg:w-1/4 p-4 flex flex-col bg-white items-center z-50 transform -translate-x-full transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <XMarkIcon onClick={toggleMenu} className="w-5 h-5 cursor-pointer mb-4" />
        <NavLinks />
      </div>

      {/* Overlay */}
      <div
        onClick={toggleMenu}
        className={clsx(
          "fixed top-0 left-0 h-dvh w-full z-40 bg-black/20",
          isOpen ? "block" : "hidden"
        )}
      />
    </div>
  );
}
