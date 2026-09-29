// frontend/src/pages/AuthViewPage.tsx
import { AuthView } from "@neondatabase/auth-ui";
import { useLocation } from "react-router-dom";

export default function AuthViewPage() {
  const location = useLocation();
  return <AuthView pathname={location.pathname} />;
}