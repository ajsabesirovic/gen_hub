import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { HeartHandshake, UserRoundPen, Loader2 } from 'lucide-react';
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

  const handleBabysitterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleRoleSubmit('babysitter');
  };

  const handleParentSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleRoleSubmit('parent');
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
            Choose the role that best fits your needs. Whether you're looking for
            childcare services or offering babysitting services, you're in the right place to begin.
          </p>
        </CardHeader>

        <Separator className="my-4" />

        <CardContent>
          <Tabs defaultValue="babysitter" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted">
              <TabsTrigger value="babysitter">Babysitter</TabsTrigger>
              <TabsTrigger value="parent">Parent</TabsTrigger>
            </TabsList>

            <TabsContent value="babysitter">
              <div className="space-y-4 text-center">
                <UserRoundPen className="w-8 h-8 mx-auto text-primary" />
                <h2 className="text-lg font-semibold">Join as a Babysitter</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  As a babysitter, you play a key role in providing safe and reliable childcare
                  services. You'll help parents by caring for their children, creating a trusted
                  connection with families in your community. Your experience, skills, and
                  dedication make a real difference in children's lives and give parents peace of mind.
                </p>
                <form onSubmit={handleBabysitterSubmit}>
                  <Button
                    type="submit"
                    className="mt-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && selectedRole === 'babysitter' ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Selecting...
                      </>
                    ) : (
                      'Select Babysitter'
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="parent">
              <div className="space-y-4 text-center">
                <UserRoundPen className="w-8 h-8 mx-auto text-primary" />
                <h2 className="text-lg font-semibold">Join as a Parent</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  As a parent, this platform offers you a safe and reliable way to find
                  qualified babysitters for your children. Whether you need occasional care,
                  regular childcare, or someone you can trust, our network of experienced
                  babysitters is here to help. Find the perfect match for your family's needs.
                </p>
                <form onSubmit={handleParentSubmit}>
                  <Button
                    type="submit"
                    className="mt-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && selectedRole === 'parent' ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Selecting...
                      </>
                    ) : (
                      'Select Parent'
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


