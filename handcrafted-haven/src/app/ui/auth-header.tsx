"use client";

import Image from "next/image";

type AuthHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-6">
      <Image
        src="/logo.png"
        alt="Handcrafted Haven Logo"
        width={80}
        height={80}
        className="mb-3"
      />
      <h1 className="text-2xl font-bold text-[#584b53]">{title}</h1>
      {subtitle && (
        <p className="text-sm text-gray-600 text-center mt-1">{subtitle}</p>
      )}
    </div>
  );
}
