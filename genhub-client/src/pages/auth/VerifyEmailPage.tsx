import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { resendVerificationEmail, verifyEmail, type ApiError } from '@/api/auth';
import { useTimer } from '@/hooks/useTimer';
import AuthLayout from '@/components/AuthLayout';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;
const LOGIN_REDIRECT_DELAY_MS = 1500;

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [code, setCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  const { timeLeft, start: startTimer, reset: resetTimer } = useTimer();
  const otpContainerRef = useRef<HTMLDivElement | null>(null);

  const focusOtpInput = useCallback(() => {
    requestAnimationFrame(() => {
      const firstInput = otpContainerRef.current?.querySelector<HTMLInputElement>('input');
      firstInput?.focus();
    });
  }, []);

  useEffect(() => {
    if (!email) {
      toast.error('Email is required.');
      navigate('/register', { replace: true });
      return;
    }
    focusOtpInput();
  }, [email, focusOtpInput, navigate]);

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    toast.success('Email verified successfully!');
    setTimeout(() => {
      navigate('/login');
    }, LOGIN_REDIRECT_DELAY_MS);
  };

  const parseVerificationError = (apiError?: ApiError) => {
    if (!apiError) {
      return {
        message: 'Verification failed. Please try again.',
        shouldBlock: false,
      };
    }

    const baseMessage = apiError.detail ?? apiError.message ?? 'Verification failed. Please try again.';
    const normalized = baseMessage.toLowerCase();

    if (normalized.includes('expired')) {
      return {
        message: 'Verification code has expired. Please request a new one.',
        shouldBlock: false,
      };
    }

    if (apiError.attempts_remaining !== undefined) {
      const remaining = Math.max(0, apiError.attempts_remaining);
      if (remaining === 0) {
        return {
          message: 'Maximum verification attempts exceeded. Please request a new code.',
          shouldBlock: true,
        };
      }
    }

    return {
      message: baseMessage,
      shouldBlock: false,
    };
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (code.length !== OTP_LENGTH) {
      setErrorMessage('Please enter the complete 6-digit code.');
      focusOtpInput();
      return;
    }

    if (!email || isBlocked) {
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      await verifyEmail(email, code);
      handleVerificationSuccess();
    } catch (err) {
      const error = err as { response?: { data?: ApiError } };
      const errorData = error.response?.data;
      const parsed = parseVerificationError(errorData);

      setIsBlocked(parsed.shouldBlock);
      setErrorMessage(parsed.message);

      setCode('');
      focusOtpInput();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || isResending || timeLeft > 0) {
      return;
    }

    setIsResending(true);
    setErrorMessage(null);

    try {
      await resendVerificationEmail(email);
      toast.success('Verification code sent! Please check your email.');

      setCode('');
      focusOtpInput();
      setIsBlocked(false);
      resetTimer();
      startTimer(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const error = err as { response?: { data?: ApiError } };
      const errorData = error.response?.data;
      const retryAfter = errorData?.retry_after;

      if (retryAfter && retryAfter > 0) {
        startTimer(Math.ceil(retryAfter));
      }

      const errorText =
        errorData?.detail ||
        errorData?.message ||
        'Failed to resend verification code. Please try again.';

      const rateLimited =
        retryAfter ||
        errorText.toLowerCase().includes('wait') ||
        errorText.toLowerCase().includes('limit');

      setErrorMessage(
        rateLimited
          ? 'Please wait before requesting another verification code.'
          : errorText,
      );
      toast.error(
        rateLimited
          ? 'Please wait before requesting another verification code.'
          : errorText,
      );
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  if (isVerified) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center shadow-sm">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="size-7 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Email verified!</h1>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Redirecting to login...
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  const resendDisabled = isResending || timeLeft > 0;
  const resendLabel = isResending
    ? 'Sending...'
    : timeLeft > 0
      ? `Resend code in ${timeLeft}s`
      : 'Resend';
  const resendAriaLabel =
    timeLeft > 0
      ? `Resend verification code available in ${timeLeft} seconds`
      : 'Resend verification code';

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6 rounded-2xl border bg-card p-12 shadow-sm">
        <form onSubmit={handleVerify} className="flex flex-col gap-6">
          <FieldGroup className="gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-xl font-bold">Enter verification code</h1>
              <FieldDescription>
                We sent a 6-digit code to{' '}
                <span className="font-medium">{email}</span>
              </FieldDescription>
            </div>

            <Field className="items-center gap-4">
              <FieldLabel htmlFor="otp-input" className="sr-only">
                Verification Code
              </FieldLabel>
              <div className="flex w-full justify-center px-4 py-6" ref={otpContainerRef}>
                <InputOTP
                  id="otp-input"
                  maxLength={OTP_LENGTH}
                  value={code}
                  onChange={setCode}
                  disabled={isVerifying || isBlocked}
                  aria-label="Enter 6-digit verification code"
                  aria-invalid={Boolean(errorMessage)}
                  containerClassName="justify-center gap-4"
                >
                  <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <FieldError
                errors={errorMessage ? [{ message: errorMessage }] : undefined}
              />
              <FieldDescription className="text-center text-sm">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendDisabled}
                  aria-label={resendAriaLabel}
                  className="font-medium text-primary underline underline-offset-4 disabled:cursor-not-allowed disabled:text-muted-foreground"
                >
                  {resendDisabled ? resendLabel : 'Resend'}
                </button>
              </FieldDescription>
            </Field>

            <Field>
              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying || isBlocked || code.length !== OTP_LENGTH}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>

        {isBlocked && (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="size-4" />
            <AlertDescription>
              Maximum verification attempts exceeded. Please request a new code.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AuthLayout>
  );
}

