import { AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ParentProfile } from '@/components/ParentProfile';
import { BabysitterProfile } from '@/components/BabysitterProfile';

export function UserProfile() {
  const { user, isLoading, refreshUser } = useChunkedAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Please log in to view your profile</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (user.role === 'parent') {
    return <ParentProfile user={user} onRefresh={refreshUser} />;
  }

  if (user.role === 'babysitter') {
    return <BabysitterProfile user={user} onRefresh={refreshUser} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Unsupported role configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Your account role is not recognized.</p>
      </CardContent>
    </Card>
  );
}

function useChunkedAuth() {
  const { user, isLoading, refreshUser } = useAuth();
  return { user, isLoading, refreshUser };
}


