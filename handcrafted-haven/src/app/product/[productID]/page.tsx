import Header from '@/app/ui/landing-page/header';
import Footer from '@/app/ui/footer';
import { getFakeProducts } from '@/app/lib/data';

export default async function ProductPage({ params }: { params: { productId: string } }) {
  const allProducts = await getFakeProducts();
  const product = allProducts.find(p => String(p.id) === params.productId);

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

  return (
    <div>
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <img src={product.image} alt={product.title} className="w-full h-auto mb-4 rounded-lg" />
        <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
        <p className="text-xl font-semibold mb-2">${product.price}</p>
        <p className="mb-4">{product.description}</p>
        <button className="py-2 px-4 bg-[#FF8C42] text-white rounded-lg hover:bg-[#584b53] transition">
          Add to Cart
        </button>
      </div>
      <Footer />
    </div>
  );
}
