import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { UserRole } from './types/user';

export function NonAdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

    const isAdmin = user?.is_staff || user?.is_superuser;

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}

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

    const isAdmin = user?.is_staff || user?.is_superuser;

    if (allowed?.includes('admin' as UserRole)) {
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

      if (isAdmin && !allowed?.includes('admin' as UserRole)) {
        return <>{children}</>;
  }

  if (!user?.role && !isAdmin) {
    return <Navigate to="/choose-role" replace />;
  }

  if (allowed && user?.role && !allowed.includes(user.role)) {
    return <Navigate to="/tasks" replace />;
  }

  return <>{children}</>;
}

