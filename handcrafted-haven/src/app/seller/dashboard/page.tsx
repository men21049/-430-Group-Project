import Header from '@/app/ui/landing-page/header';
import Footer from '@/app/ui/footer';
import Link from 'next/link';
import CallToAction from '@/app/ui/landing-page/cta-section';

export default function SellerDashboard() {
  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
        <p>Welcome! Manage your products and shop here.</p>

        <div className="mt-4 flex gap-4">
          <Link href="/shop">
            <button className="px-4 py-2 bg-orange-500 text-white rounded">View All Products</button>
          </Link>
          <Link href="/seller/products">
            <button className="px-4 py-2 bg-green-500 text-white rounded">Manage My Products</button>
          </Link>
        </div>
      </div>
      <CallToAction />
      <Footer />
    </div>
  );
}
