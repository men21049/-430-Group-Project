import Header from "@/app/ui/landing-page/header";
import Footer from "@/app/ui/footer";
import CallToAction from "@/app/ui/landing-page/cta-section";

export default function SellerProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <CallToAction />
    </div>
  );
}
