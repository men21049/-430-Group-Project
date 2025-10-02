'use client';
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchProps {
  placeholder: string;
  className?: string;
}

export default function Search({ placeholder, className }: SearchProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 border bg-white border-gray-300 py-2 px-3 rounded-md ${className}`}
    >
      <MagnifyingGlassIcon
        className="w-5 h-5 cursor-pointer"
        onClick={handleSubmit}
      />
      <input
        type="text"
        name="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="outline-none w-full"
      />
    </form>
  );
}
