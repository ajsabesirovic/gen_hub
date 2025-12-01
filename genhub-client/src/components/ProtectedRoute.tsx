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

export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}

export function VolunteerRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard allowed={['volunteer']}>
          {children}
      </RoleGuard>
    </AuthGuard>
  );
}

export function SeniorRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard allowed={['senior']}>
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