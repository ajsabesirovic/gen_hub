import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { getErrorMessage } from "@/lib/error-utils";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsPending(false);
      return;
    }

    try {
      await axiosInstance.post("/auth/registration/", JSON.stringify({
        name,
        username,
        email,
        password1:password,
        password2:confirmPassword,
      }));

      toast.success("Registration successful! Please verify your email.");
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to create account. Please try again."));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-left">
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>
          Enter your information to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
            <Input
              id="name"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <PasswordInput
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <PasswordInput
              id="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <span>Create account</span>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

