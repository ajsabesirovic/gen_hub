import { ThemeToggle } from "@/components/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserDropdown } from "./UserDropdown";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { session, isPending } = useAuth();
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-6 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="GenHub Logo" 
              className="h-7 w-7 object-contain"
            />
            <span className="text-xl font-bold">GenHub</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isPending ? null : session ? (
              <UserDropdown
                name={
                  session?.user.name && session?.user.name.length > 0
                    ? session?.user.name
                    : session?.user.email.split("@")[0]
                }
                email={session.user.email}
                image={
                  session?.user.image ??
                  `https://avatar.vercel.sh/${session?.user.email}`
                }
              />
            ) : (
              <Link to="/login" className={buttonVariants()}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

