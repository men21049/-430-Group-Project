import Header from "@/app/ui/landing-page/header";
import Navigation from "./navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <Navigation />
      {children}
    </div>
  );
}
