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
  const { setAccessToken, setSession } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    try {
      const response = await axiosInstance.post("/auth/login", JSON.stringify({
        username,
        password,
      }));

      const { access, user } = response.data;

      setAccessToken(access);
      setSession({ user });

      toast.success("Successfully logged in!");
      navigate("/");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
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
            {/* <Label htmlFor="username">username</Label> */}
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
            {/* <Label htmlFor="password">password</Label> */}
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

