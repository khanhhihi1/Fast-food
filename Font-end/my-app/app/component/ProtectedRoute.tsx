"use client";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

<<<<<<< HEAD
=======
interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string;
}
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login"); // Nếu chưa đăng nhập → login
      } else if (requireAdmin && user.role !== "admin") {
        router.push("/"); // Nếu không phải admin → quay về trang chủ
      }
    }
  }, [user, loading, requireAdmin]);

  if (loading) return <div>Loading...</div>;

  return <>{children}</>;
}
