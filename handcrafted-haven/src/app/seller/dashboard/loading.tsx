// src/app/shop/loading.tsx
import React from "react";
import Skeleton from "@/app/ui/Skeleton"; // if @ alias doesn’t work, use relative: ../../ui/Skeleton

export default function Loading() {
  return (
    <div className="p-6">
      <Skeleton className="h-8 w-1/3 mb-4" />
      <Skeleton className="h-64 w-full mb-4" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
      </div>
    </div>
  );
}
