// src/app/seller/products/loading.tsx
import SkeletonCard from "@/app/ui/Skeleton";

export default function LoadingSellerProducts() {
  return (
    <div className="max-w-7xl mx-auto p-6 animate-pulse">
      <div className="h-8 w-1/3 bg-gray-200 rounded mb-6 mx-auto"></div> {/* page title */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <li key={i}>
            <SkeletonCard />
          </li>
        ))}
      </ul>
    </div>
  );
}
