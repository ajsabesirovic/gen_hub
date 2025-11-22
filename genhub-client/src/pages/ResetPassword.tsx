import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/AuthLayout";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  const { session } = useAuth();
  const { uid, token } = useParams<{ uid: string; token: string }>();

  if (session) {
    return <Navigate to="/" replace />;
  }

  if (!uid || !token) {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <AuthLayout>
      <ResetPasswordForm uid={uid} token={token} />
    </AuthLayout>
  );
}

