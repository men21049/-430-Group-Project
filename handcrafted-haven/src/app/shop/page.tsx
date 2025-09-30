import Header from '@/app/ui/landing-page/header';
import Footer from '@/app/ui/footer';
import { getFakeProducts } from '@/app/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/app/lib/definitions';

export default async function ShopPage() {
  const products: Product[] = await getFakeProducts();

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Shop All Products</h1>
        
        {/* Remove flex justify-center and let grid fill width */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <li className="flex flex-col gap-3 cursor-pointer hover:scale-105 transition-transform duration-200">
                <div className="relative w-full h-60 rounded-lg bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="font-bold">${product.price}</p>
                </div>
              </li>
            </Link>
          ))}
        </ul>
      </div>
      <Footer />
    </div>
  );
}
