import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkAuth } from "../../services/adminApi";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    checkAuth()
      .then((ok) => setStatus(ok ? "ok" : "denied"))
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-color)" }}>
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "denied") return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}