"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  const handleShopNow = () => {
    router.push("/shop"); // ✅ updated from /products → /shop
  };

  return (
    <div
      id="hero"
      className="flex flex-col items-center h-screen justify-center relative"
    >
      <Image
        src={"/artisans/hero-picture.jpg"}
        alt="hero picture"
        fill={true}
        className="relative object-cover"
        priority={true}
      />
      <div className="absolute inset-0 h-full z-50 flex flex-col items-center justify-evenly gap-2 p-2 w-full bg-black/50 text-white ">
        <h1 className="text-3xl font-bold text-center">
          Discover Handmade Treasures
        </h1>
        <h2 className="text-lg text-center max-w-200">
          Step into a world where every item tells a story. Each piece is
          carefully crafted by skilled artisans, designed to bring warmth and
          character to your home. Celebrate the beauty of objects made with
          heart and hands.
        </h2>
        <button
          type="button"
          onClick={handleShopNow}
          className="bg-white text-black py-2 px-4 rounded-md cursor-pointer transition-all duration-300 transform hover:bg-[#FF8C42] hover:text-white hover:scale-105 active:scale-95"
        >
          Shop now
        </button>
      </div>
    </div>
  );
}
