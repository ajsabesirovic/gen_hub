import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function useSignOut() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return async () => {
    await logout();
    navigate("/login");
  };
}

