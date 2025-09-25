"use client";

import Image from "next/image";
import Link from "next/link";
import NavigationBar from "@/app/ui/sidenav";
import { useState, useEffect } from "react";
import clsx from "clsx";
import Search from "../search";

export default function Header() {
  const [hideHeader, setHideHeader] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    // The handleScroll function is a callback function that is called when the scroll event is triggered.
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling down -> Hide header
        setHideHeader(true);
      } else {
        // Scrolling up -> Show header
        setHideHeader(false);
      }

      setLastScroll(currentScroll);
    };

    //The page listens to the scroll event, and when the scroll position changes, it calls the handleScroll function.
    window.addEventListener("scroll", handleScroll);

    return () => {
      // Remove the scroll event listener when the component unmounts.
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScroll]); // Listens to changes in the lastScroll variable

  return (
    <header
      className={clsx(
        "sticky top-0 flex flex-row flex-wrap items-center justify-evenly z-9999 gap-3 p-4 bg-white shadow-md transition-transform duration-300 ease-in-out",
        hideHeader ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <NavigationBar />
      <Image
        src={"/transparent-logo.png"}
        alt={"logo"}
        width={100}
        height={150}
        style={{ width: "auto", height: "auto" }}
      />
      <Search placeholder="Search anything..." className="w-full max-w-1/2" />
      <Link
        href="/signin"
        className="font-bold bg-gray-100 p-2 rounded-2xl text-center"
      >
        Sign In
      </Link>
    </header>
  );
}
