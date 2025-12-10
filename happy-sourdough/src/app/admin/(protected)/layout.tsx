import { requireAdmin } from '@/lib/supabase/auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication - will redirect to /admin/login if not authenticated
  // or to / if user is not an admin
  const user = await requireAdmin();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader user={user} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
