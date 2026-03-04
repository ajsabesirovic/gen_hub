import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignOut } from "@/hooks/use-signout";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronDown,
  LogOutIcon,
  User,
  LayoutDashboard,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  name: string;
  email: string;
  image: string;
}
export function UserDropdown({ name, email, image }: Props) {
  const handleSignOut = useSignOut();
  const { user } = useAuth();

    const isAdmin = user?.is_staff || user?.is_superuser;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar>
            <AvatarImage src={image} alt="Profile image" />
            <AvatarFallback>{name[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <ChevronDown size={16} className="opacity-60" aria-hidden={true} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
                {!isAdmin && (
          <>
            <DropdownMenuItem asChild className="p-0 font-normal cursor-pointer">
              <Link to="/profile" className="flex items-center gap-2 px-2 py-1.5 text-left text-sm w-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={image} alt="Profile image" />
                  <AvatarFallback>{name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="text-muted-foreground truncate text-xs">{email}</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

                <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard size={16} className="opacity-60" aria-hidden="true" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
