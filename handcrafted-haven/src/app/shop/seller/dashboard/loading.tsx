// src/app/seller/dashboard/loading.tsx
export default function LoadingDashboard() {
  return (
    <div className="animate-pulse">
      <div className="max-w-7xl mx-auto p-4">
        <div className="h-10 bg-gray-200 rounded mb-4 w-1/3"></div> {/* title */}
        <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div> {/* subtitle */}
        <div className="flex gap-4 mt-4">
          <div className="h-10 w-40 bg-gray-300 rounded"></div> {/* button 1 */}
          <div className="h-10 w-48 bg-gray-300 rounded"></div> {/* button 2 */}
        </div>

        <div className="mt-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div> // placeholder for dashboard cards
          ))}
        </div>
      </div>
    </div>
  );
}
