import {
  IconDotsVertical,
  IconLogout,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"
import { useSignOut } from "@/hooks/use-signout"
import { useAuth } from "@/contexts/AuthContext"
import { getProfileImageUrl } from "@/lib/utils"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user } = useAuth();

    const isAdmin = user?.is_staff || user?.is_superuser;

  const handleSignOut = useSignOut();
  return (
    <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-lg ">
              <AvatarImage
                src={getProfileImageUrl(user?.profile_image, user?.email)}
                alt={user?.name!}
              />
              <AvatarFallback className="rounded-lg">
                {user?.name && user?.name.length > 0
                  ? user.name.charAt(0).toUpperCase()
                  : user?.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user?.name && user?.name.length > 0
                  ? user?.name
                  : user?.email.split("@")[0]}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {user?.email}
              </span>
            </div>
            <IconDotsVertical className="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          {!isAdmin && (
            <>
              <DropdownMenuItem asChild className="p-0 font-normal cursor-pointer">
                <Link to="/profile" className="flex items-center gap-2 px-1 py-1.5 text-left text-sm w-full">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={getProfileImageUrl(user?.profile_image, user?.email)}
                      alt={user?.name!}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.name && user?.name.length > 0
                        ? user?.name?.charAt(0).toUpperCase()
                        : user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user?.name && user?.name.length > 0
                        ? user?.name
                        : user?.email.split("@")[0]}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user?.email}
                    </span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => {
            handleSignOut();
          }}>
            <IconLogout size={16} className="opacity-60" aria-hidden="true" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
 )
}
