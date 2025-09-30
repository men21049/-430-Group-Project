"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

export default function PasswordInput({
  name,
  value,
  onChange,
  placeholder = "Password",
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full">
      <input
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#9d5c63] focus:outline-none pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#9d5c63] focus:outline-none"
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
