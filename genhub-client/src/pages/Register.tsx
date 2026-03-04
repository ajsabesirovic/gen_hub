import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/AuthLayout";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}

