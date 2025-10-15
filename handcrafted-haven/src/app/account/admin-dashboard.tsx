// src/app/account/admin-dashboard.tsx
interface AdminDashboardProps {
  user: any; // Replace with your User type if you have one
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, {user.name || "Admin"}.</p>
      <p>Here you can manage users, products, and site settings.</p>
    </div>
  );
}
