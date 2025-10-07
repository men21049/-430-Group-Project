import Header from '@/app/ui/landing-page/header';
import Footer from '@/app/ui/footer';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

interface ProductPageProps {
  params: {
    productId: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    include: {
      seller: true, // optional: include seller info
    },
  });

  if (!product) {
    return (
      <div>
        <Header />
        <div className="max-w-7xl mx-auto p-4">
          <p>Product not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const imageSrc = product.image
    ? `/artisans/${product.image}` // path to uploaded image in public/artisans
    : '/artisans/fallback.jpg'; // fallback image

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-auto mb-4 rounded-lg object-cover"
        />
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-xl font-semibold mb-2">${product.price.toFixed(2)}</p>
        {product.category && (
          <p className="text-gray-500 mb-4">Category: {product.category}</p>
        )}
        {product.description && <p className="mb-4">{product.description}</p>}
        <button className="py-2 px-4 bg-[#FF8C42] text-white rounded-lg hover:bg-[#584b53] transition">
          Add to Cart
        </button>
      </div>
      <Footer />
    </div>
  );
}
