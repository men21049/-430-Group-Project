// src/app/account/page.tsx
import WithAuth from "@/app/components/withAuth";
import CustomerDashboard from "@/app/customer/dashboard/page";
import SellerDashboard from "@/app/shop/seller/dashboard/page";

// Minimal placeholder for admin
function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, Admin! Management links will appear here.</p>
    </div>
  );
}

// Mock function to get current user
// Replace this with your real auth fetching logic
async function getCurrentUser() {
  // Example: fetch("/api/auth/me").then(res => res.json())
  return {
    id: "123",
    name: "John Doe",
    role: "CUSTOMER", // "SELLER" or "ADMIN"
  };
}

export default async function AccountPageWrapper() {
  const user = await getCurrentUser();

  if (!user) {
    return <p className="text-center py-20">Please log in to view your account.</p>;
  }

  let DashboardComponent;
  switch (user.role) {
    case "CUSTOMER":
      DashboardComponent = <CustomerDashboard />;
      break;
    case "SELLER":
      DashboardComponent = <SellerDashboard />;
      break;
    case "ADMIN":
      DashboardComponent = <AdminDashboard />;
      break;
    default:
      DashboardComponent = (
        <p className="text-center py-20">Unknown role. Contact support.</p>
      );
  }

  return <div className="min-h-screen flex flex-col">{DashboardComponent}</div>;
}

export function Account() {
  return (
    <WithAuth>
      <AccountPageWrapper />
    </WithAuth>
  );
}
