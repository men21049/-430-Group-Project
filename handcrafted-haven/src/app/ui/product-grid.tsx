interface ProductGridProps {
  products: {
    id: string;
    name: string;
    price: number;
    image: string;
  }[];
  title?: string;
  emptyMessage?: string;
  onRemove?: (id: string) => void;
}

export default function ProductGrid({
  products,
  title,
  emptyMessage,
  onRemove,
}: ProductGridProps) {
  return (
    <div>
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}

      {products.length === 0 ? (
        <p className="text-gray-500">{emptyMessage || "No products available."}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition relative"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-2">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-[#FF8C42] font-bold">${p.price}</p>
              </div>

              {onRemove && (
                <button
                  onClick={() => onRemove(p.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-sm rounded hover:bg-red-700 transition transform hover:scale-105 active:scale-95"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
