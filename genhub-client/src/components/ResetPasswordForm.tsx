import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { parseBackendErrors, getFieldError, type ParsedErrors } from "@/lib/error-utils";

interface ResetPasswordFormProps {
  uid: string;
  token: string;
}

interface FormErrors {
  new_password1: string | null;
  new_password2: string | null;
  general: string | null;
}

export default function ResetPasswordForm({ uid, token }: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    new_password1: null,
    new_password2: null,
    general: null,
  });
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (touched.password && password) {
      setErrors((prev) => ({ ...prev, new_password1: null }));
    }
  }, [password, touched.password]);

  useEffect(() => {
    if (touched.confirmPassword && confirmPassword) {
      setErrors((prev) => ({ ...prev, new_password2: null }));
    }
  }, [confirmPassword, touched.confirmPassword]);

  function validateForm(): boolean {
    const newErrors: FormErrors = {
      new_password1: null,
      new_password2: null,
      general: null,
    };

    if (!password) {
      newErrors.new_password1 = "Password is required";
    } else if (password.length < 8) {
      newErrors.new_password1 = "Password must be at least 8 characters long";
    }

    if (!confirmPassword) {
      newErrors.new_password2 = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.new_password2 = "Passwords do not match";
    }

    setErrors(newErrors);
    setTouched({ password: true, confirmPassword: true });

    return !newErrors.new_password1 && !newErrors.new_password2;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    setErrors({
      new_password1: null,
      new_password2: null,
      general: null,
    });

    if (!validateForm()) {
      return;
    }

    setIsPending(true);

    try {
      await axiosInstance.post("/auth/password/reset/confirm", JSON.stringify({
        uid,
        token,
        new_password1: password,
        new_password2: confirmPassword,
      }));

      toast.success("You can now login with your new password.");
      navigate("/login");
    } catch (error: any) {
      const parsedErrors: ParsedErrors = parseBackendErrors(error);
      const newErrors: FormErrors = {
        new_password1: getFieldError(parsedErrors.fieldErrors, "new_password1"),
        new_password2: getFieldError(parsedErrors.fieldErrors, "new_password2"),
        general: parsedErrors.nonFieldErrors[0] || parsedErrors.genericError,
      };

      setErrors(newErrors);

      if (newErrors.general) {
        toast.error(newErrors.general);
      } else if (newErrors.new_password1 || newErrors.new_password2) {
        toast.error("Please fix the errors below");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-left">
        <CardTitle className="text-xl">Reset password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errors.general && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <div className="grid gap-2">
            <Input
              id="password"
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) {
                  setErrors((prev) => ({ ...prev, new_password1: null }));
                }
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              required
              disabled={isPending}
              className={errors.new_password1 ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={!!errors.new_password1}
              aria-describedby={errors.new_password1 ? "password-error" : undefined}
            />
            {errors.new_password1 && (
              <p
                id="password-error"
                className="text-sm text-destructive flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="size-3" />
                {errors.new_password1}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (touched.confirmPassword) {
                  setErrors((prev) => ({ ...prev, new_password2: null }));
                }
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
              required
              disabled={isPending}
              className={errors.new_password2 ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={!!errors.new_password2}
              aria-describedby={errors.new_password2 ? "confirm-password-error" : undefined}
            />
            {errors.new_password2 && (
              <p
                id="confirm-password-error"
                className="text-sm text-destructive flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="size-3" />
                {errors.new_password2}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending || !password || !confirmPassword}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Resetting password...</span>
              </>
            ) : (
              <span>Reset password</span>
            )}
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              <ArrowLeft className="size-4" />
              Back to login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
