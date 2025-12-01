import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowRight } from 'lucide-react';
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
import { requestPasswordReset } from '@/api/user';
import { 
  resetPasswordSchema, 
  type ResetPasswordFormData 
} from '@/lib/validation';
import { useAuth } from '@/contexts/AuthContext';

interface PasswordResetRequestProps {
  noCard?: boolean;
}

export default function PasswordResetRequest({ noCard = false }: PasswordResetRequestProps) {
  const { user } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });

  const onSubmit = async (values: ResetPasswordFormData) => {
    setIsPending(true);

    try {
      await requestPasswordReset(values);
      toast.success('Password reset email sent! Please check your inbox.');
      setEmailSent(true);
    } catch (err: unknown) {
      const error = err as { 
        response?: { 
          data?: { 
            detail?: string; 
            message?: string;
            email?: string[];
          } 
        } 
      };
      const errorData = error.response?.data;
      
      if (errorData?.email) {
        form.setError('email', { message: errorData.email[0] });
      }
      
      const errorMessage = errorData?.detail || errorData?.message || 'Failed to send reset email';
      toast.error(errorMessage);
    } finally {
      setIsPending(false);
    }
  };

  if (emailSent) {
    const emailSentContent = (
      <div className="space-y-4">
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="text-sm font-medium">
            We've sent password reset instructions to:
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            {form.getValues('email')}
          </p>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Please check your email inbox and follow the instructions to reset your password.</p>
          <p>If you don't see the email, check your spam folder.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setEmailSent(false);
            form.reset();
          }}
          className="w-full"
        >
          Send Another Email
        </Button>
      </div>
    );

    if (noCard) {
      return (
        <>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="size-5 text-primary" />
              <h3 className="text-lg font-semibold">Check Your Email</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Password reset instructions have been sent
            </p>
          </div>
          {emailSentContent}
        </>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="size-5 text-primary" />
            <CardTitle>Check Your Email</CardTitle>
          </div>
          <CardDescription>
            Password reset instructions have been sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSentContent}
        </CardContent>
      </Card>
    );
  }

  const formFields = (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="Enter your email address" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                We'll send password reset instructions to this email address.
              </FormDescription>
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
              Sending Reset Email...
              <Loader2 className="animate-spin ml-2 size-4" />
            </>
          ) : (
            <>
              Send Reset Email
              <ArrowRight className="ml-2 size-4" />
            </>
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
            <Mail className="size-5 text-primary" />
            <h3 className="text-lg font-semibold">Request Password Reset</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
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
          <Mail className="size-5 text-primary" />
          <CardTitle>Request Password Reset</CardTitle>
        </div>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formFields}
      </CardContent>
    </Card>
  );
}
