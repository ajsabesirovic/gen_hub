/**
 * Login Form Component
 * ====================
 * 
 * Handles user authentication via username/email and password.
 * 
 * ON SUCCESSFUL LOGIN:
 * 1. Backend returns:
 *    - `access`: Short-lived access token (stored in React memory)
 *    - `user`: User profile data
 *    - HttpOnly cookie: Refresh token (set automatically by browser)
 * 
 * 2. We call `login(access, user)` which stores:
 *    - Access token in React state (memory only, never localStorage)
 *    - User data in React state
 * 
 * 3. The HttpOnly refresh token cookie is handled entirely by the browser
 *    and backend - JavaScript never touches it.
 */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/lib/axios";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    try {
      /**
       * Login request
       * 
       * Backend should return:
       * - access: JWT access token
       * - user: User profile data
       * 
       * Backend should also set:
       * - HttpOnly cookie with refresh token (we don't see this in JS)
       */
      const response = await axiosInstance.post("/auth/login/", {
        username,
        password,
      });

      const { access, user } = response.data;

      login(access, user);
      
      if (!user.role) {
        navigate("/choose-role");
      } else {
        navigate("/profile");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; detail?: string } } };
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "An error occurred during login";
      toast.error(errorMessage);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-left">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>
          Login with your username or email and password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Input
              id="username"
              type="text"
              placeholder="Email or Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isPending}
            />
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline text-left"
            >
              Forgot password?
            </Link>
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
              <span>Sign in</span>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary hover:underline font-medium"
            >
              Create a new account
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
