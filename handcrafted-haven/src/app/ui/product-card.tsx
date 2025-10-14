interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer">
      <img
        src={product.image || "/artisans/amin-ybW2t0bEqm0-unsplash.jpg"} // fallback
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-2">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-[#FF8C42] font-bold">${product.price}</p>
      </div>
    </div>
  );
}
