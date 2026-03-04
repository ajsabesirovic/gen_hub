import { AuthGuard, RoleGuard } from "@/guards";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard>
          {children}
      </RoleGuard>
    </AuthGuard>
  );
}
export function BabysitterRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard allowed={['babysitter']}>
          {children}
      </RoleGuard>
    </AuthGuard>
  );
}

export function ParentRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard allowed={['parent']}>
          {children}
      </RoleGuard>
    </AuthGuard>
  );
}

export function AdminRoute({ children }: { children: React.ReactNode }) {   
  return (
    <AuthGuard>
      <RoleGuard allowed={['admin']}>
          {children}
      </RoleGuard>
    </AuthGuard>
  );
}