"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CallToAction() {
  const router = useRouter();

  const handleExploreNow = () => {
    router.push("/shop"); // ✅ updated from /products → /shop
  };

  return (
    <div className="flex flex-col items-center justify-center relative h-100">
      <Image
        src={"/artisans/cta-picture.jpg"}
        alt="artisan's picture"
        fill={true}
        className="relative object-cover"
      />
      <div className="absolute inset-0 h-full z-50 flex flex-col items-center justify-evenly gap-2 p-2 w-full bg-black/50 text-white">
        <h3 className="text-xl font-bold text-center">
          Handmade with <span className="text-red-500">love</span>, delivered
          with <span className="text-red-500">care</span>. Make it{" "}
          <span className="text-red-500">yours</span>.
        </h3>
        <button
          type="button"
          onClick={handleExploreNow}
          className="bg-white text-black py-2 px-4 rounded-md cursor-pointer transition-all duration-300 transform hover:bg-[#FF8C42] hover:text-white hover:scale-105 active:scale-95"
        >
          Explore now
        </button>
      </div>
    </div>
  );
}
