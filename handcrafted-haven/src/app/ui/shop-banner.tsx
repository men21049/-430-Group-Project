interface ShopBannerProps {
  seller: {
    name: string;
    logo: string;
    banner: string;
    bio: string;
  };
}

export default function ShopBanner({ seller }: ShopBannerProps) {
  return (
    <div className="relative w-full h-64 mb-6">
      {/* Banner image */}
      <img
        src={seller.banner}
        alt={`${seller.name} Banner`}
        className="w-full h-full object-cover rounded-b-lg"
      />

      {/* Seller logo and info */}
      <div className="absolute bottom-0 left-4 flex items-center gap-4 bg-white bg-opacity-70 p-2 rounded">
        <img
          src={seller.logo}
          alt={`${seller.name} Logo`}
          className="w-16 h-16 rounded-full border-2 border-white"
        />
        <div>
          <h2 className="text-xl font-bold">{seller.name}</h2>
          <p className="text-sm text-gray-700">{seller.bio}</p>
        </div>
      </div>
    </div>
  );
}
