import Search from "./ui/search";
import Hero from "./ui/landing-page/hero";
import Header from "./ui/landing-page/header";
import Categories from "./ui/landing-page/categories";
import FeaturedProducts from "./ui/landing-page/featured-products";
import CallToAtion from "./ui/landing-page/cta-section";
import Footer from "./ui/footer";

export default function Page() {
  return (
    <main className="flex flex-col">
      <Header />
      <Hero />
      <Categories />
      <FeaturedProducts />
      <CallToAtion />
      <Footer />
    </main>
  );
}
