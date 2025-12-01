import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { UserRole } from './types/user';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function RoleGuard({
  children,
  allowed,
}: {
  children: React.ReactNode;
  allowed?: UserRole[];
}) {
  const { user } = useAuth();

  if (!user?.role) {
    return <Navigate to="/choose-role" replace />;
  }

  if (allowed && !allowed.includes(user?.role)) {
    return <Navigate to="/tasks" replace />;
  }

  return <>{children}</>;
}

