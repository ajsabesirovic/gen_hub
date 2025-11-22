import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="relative flex h-svh flex-col items-center justify-center overflow-hidden">
      <Link
        to="/"
        className={cn(buttonVariants({ variant: "outline" }), "absolute top-4 left-4 z-10")}
      >
        <ArrowLeft className="size-4" /> Back
      </Link>
      <div className="flex w-full max-w-sm flex-col gap-6 px-4 py-8">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <img 
            src="/logo.png" 
            alt="GenHub Logo" 
            className="h-8 w-8 object-contain"
          />
          GenHub
        </Link>
        {children}

        <div className="text-balance text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <span className="hover:text-primary hover:underline">
            Terms of service
          </span>{" "}
          and{" "}
          <span className="hover:text-primary hover:underline">
            Privacy Policy
          </span>
        </div>
      </div>
    </div>
  );
}

