import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function useSignOut() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return () => {
    signOut();
    navigate("/login");
  };
}

