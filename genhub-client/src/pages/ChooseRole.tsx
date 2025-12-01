import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { HeartHandshake, UserRoundPen, Loader2, Shield } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { updateUserProfile } from '@/api/user';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/user';

export default function ChooseRole() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const handleRoleSubmit = async (role: UserRole) => {
    if (!role || isSubmitting) return;

    setIsSubmitting(true);
    setSelectedRole(role);

    try {
      const updatedUser = await updateUserProfile({ role });
      
      updateUser({ role: updatedUser.role });

      toast.success(`Welcome! You've joined as a ${role}.`);
      
      setTimeout(() => {
        navigate('/profile', { replace: true });
      }, 500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string; message?: string } } };
      const errorData = error.response?.data;
      const errorMessage = errorData?.detail || errorData?.message || 'Failed to set role. Please try again.';
      
      toast.error(errorMessage);
      setIsSubmitting(false);
      setSelectedRole(null);
    }
  };

  const handleVolunteerSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleRoleSubmit('volunteer');
  };

  const handleSeniorSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleRoleSubmit('senior');
  };

  const handleAdminSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleRoleSubmit('admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <Card className="w-full max-w-2xl bg-card text-card-foreground border-border shadow-lg">
        <CardHeader className="flex flex-col items-center text-center">
          <HeartHandshake className="w-12 h-12 text-primary mb-4" />
          <CardTitle className="text-2xl font-bold">
            Welcome to the Community Platform
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2 max-w-md">
            Choose the role that best fits your needs. Whether you want to
            volunteer or receive help, you're in the right place to begin.
          </p>
        </CardHeader>

        <Separator className="my-4" />

        <CardContent>
          <Tabs defaultValue="volunteer" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted">
              <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
              <TabsTrigger value="senior">Senior</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="volunteer">
              <div className="space-y-4 text-center">
                <UserRoundPen className="w-8 h-8 mx-auto text-primary" />
                <h2 className="text-lg font-semibold">Join as a Volunteer</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  As a volunteer, you play a key role in improving someone's
                  life. You'll provide help, companionship, and support to
                  seniors who need assistance with everyday tasks or simply seek
                  connection. Your time and empathy can bring joy and reduce
                  isolation for older individuals. It's not just about giving —
                  it's about building meaningful relationships and learning from
                  others.
                </p>
                <form onSubmit={handleVolunteerSubmit}>
                  <Button
                    type="submit"
                    className="mt-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && selectedRole === 'volunteer' ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Selecting...
                      </>
                    ) : (
                      'Select Volunteer'
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="senior">
              <div className="space-y-4 text-center">
                <UserRoundPen className="w-8 h-8 mx-auto text-primary" />
                <h2 className="text-lg font-semibold">Join as a Senior</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  As a senior, this platform offers you a safe and friendly
                  space to receive support. Whether you need help with errands,
                  using technology, or just want someone to talk to, volunteers
                  are here to assist you with care and respect. This is your
                  opportunity to connect with younger generations, share your
                  experiences, and stay active in your community.
                </p>
                <form onSubmit={handleSeniorSubmit}>
                  <Button
                    type="submit"
                    className="mt-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && selectedRole === 'senior' ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Selecting...
                      </>
                    ) : (
                      'Select Senior'
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="admin">
              <div className="space-y-4 text-center">
                <Shield className="w-8 h-8 mx-auto text-primary" />
                <h2 className="text-lg font-semibold">Join as an Admin</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  As an admin, you have full access to manage the platform,
                  oversee volunteers and seniors, coordinate tasks, and ensure
                  the community runs smoothly. You'll be responsible for
                  maintaining quality, resolving issues, and supporting both
                  volunteers and seniors in their journey.
                </p>
                <form onSubmit={handleAdminSubmit}>
                  <Button
                    type="submit"
                    className="mt-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && selectedRole === 'admin' ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Selecting...
                      </>
                    ) : (
                      'Select Admin'
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="justify-center text-xs text-muted-foreground mt-6">
          You can always change your role later in settings.
        </CardFooter>
      </Card>
    </div>
  );
}


