import Header from '@/app/ui/landing-page/header';
import Footer from '@/app/ui/footer';
import Navigation from './navigation';

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <div>
      <Header />
      <Navigation />
      {children}
      <Footer />
    </div>
  );
}
