// app/admin/layout.tsx
import ProtectedRoute from "@/app/component/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute requireAdmin>{children}</ProtectedRoute>;
}
