import Header from '@/app/ui/landing-page/header';
import Footer from '@/app/ui/footer';
import Link from 'next/link';

export default function CustomerDashboard() {
  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to Handcrafted Haven</h1>
        <p>Browse and discover handmade treasures!</p>

        <div className="mt-4">
          <Link href="/shop">
            <button className="px-4 py-2 bg-orange-500 text-white rounded">Go to Shop</button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
