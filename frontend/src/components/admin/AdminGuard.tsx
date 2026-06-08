import { Navigate } from "react-router-dom";
import { authStorage } from "../../services/adminApi";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const token = authStorage.get();
  if (!token) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}