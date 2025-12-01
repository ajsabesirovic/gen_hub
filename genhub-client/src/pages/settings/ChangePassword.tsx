import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, KeyRound } from 'lucide-react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { changePassword } from '@/api/user';
import { 
  changePasswordSchema, 
  type ChangePasswordFormData 
} from '@/lib/validation';

interface ChangePasswordProps {
  noCard?: boolean;
}

export default function ChangePassword({ noCard = false }: ChangePasswordProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: '',
      new_password1: '',
      new_password2: '',
    },
  });

  const onSubmit = async (values: ChangePasswordFormData) => {
    setIsPending(true);

    try {
      await changePassword(values);
      toast.success('Password changed successfully!');
      form.reset();
    } catch (err: unknown) {
      const error = err as { 
        response?: { 
          data?: { 
            detail?: string; 
            message?: string;
            old_password?: string[];
            new_password1?: string[];
            new_password2?: string[];
          } 
        } 
      };
      const errorData = error.response?.data;
      
      if (errorData?.old_password) {
        form.setError('old_password', { message: errorData.old_password[0] });
      }
      if (errorData?.new_password1) {
        form.setError('new_password1', { message: errorData.new_password1[0] });
      }
      if (errorData?.new_password2) {
        form.setError('new_password2', { message: errorData.new_password2[0] });
      }
      
      const errorMessage = errorData?.detail || errorData?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsPending(false);
    }
  };

  const formFields = (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="old_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="Enter your current password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="new_password1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="Enter your new password" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Password must be at least 8 characters and include uppercase, lowercase, and numbers.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="new_password2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="Confirm your new password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              Changing Password...
              <Loader2 className="animate-spin ml-2 size-4" />
            </>
          ) : (
            'Change Password'
          )}
        </Button>
      </form>
    </Form>
  );

  if (noCard) {
    return (
      <>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">Change Password</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Update your password to keep your account secure.
          </p>
        </div>
        {formFields}
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="size-5 text-primary" />
          <CardTitle>Change Password</CardTitle>
        </div>
        <CardDescription>
          Update your password to keep your account secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formFields}
      </CardContent>
    </Card>
  );
}


