
import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/lib/authStore";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  if (!isAuthenticated && location.pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
