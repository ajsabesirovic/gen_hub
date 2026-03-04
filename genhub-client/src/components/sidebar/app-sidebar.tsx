import * as React from "react";
import { Link } from "react-router-dom";
import {
  IconCalendarCheck,
  IconClipboardList,
  IconListCheck,
  IconStar,
  IconUserCircle,
  IconUsers,
  IconDashboard,
  IconUserSearch,
  IconClipboard,
  IconCategory,
  IconSettings,
  IconMailOpened,
} from "@tabler/icons-react";

import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/user";

type NavItemBase = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
};

type NavItemWithChildren = {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  items: NavItemBase[];
};

type NavConfigItem = NavItemBase | NavItemWithChildren;

function hasChildren(item: NavConfigItem): item is NavItemWithChildren {
  return "items" in item && Array.isArray(item.items);
}

const navConfig: NavConfigItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard/babysitter",
    icon: IconDashboard,
    roles: ["babysitter"],
  },
  {
    title: "Dashboard",
    url: "/dashboard/parent",
    icon: IconDashboard,
    roles: ["parent"],
  },
  {
    title: "Browse Tasks",
    url: "/tasks",
    icon: IconListCheck,
    roles: ["babysitter"],
  },
  {
    title: "Bookings",
    url: "/bookings",
    icon: IconClipboardList,
    roles: ["babysitter"],
  },
  {
    title: "Applications & Invites",
    url: "/applications",
    icon: IconMailOpened,
    roles: ["babysitter"],
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: IconCalendarCheck,
    roles: ["parent", "babysitter"],
  },
  {
    title: "My reviews",
    url: "/reviews",
    icon: IconStar,
    roles: ["babysitter"],
  },
  {
    title: "Find a babysitter",
    url: "/babysitters",
    icon: IconUsers,
    roles: ["parent"],
  },
  {
    title: "Task Applications",
    url: "/task-applications",
    icon: IconClipboardList,
    roles: ["parent"],
  },
  {
    title: "Availability",
    url: "/availability",
    icon: IconCalendarCheck,
    roles: ["babysitter"],
  },
  {
    title: "Profile",
    url: "/profile",
    icon: IconUserCircle,
    roles: ["parent", "babysitter"],
  },
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: IconDashboard,
    roles: ["admin"],
  },
  {
    title: "Manage",
    icon: IconSettings,
    roles: ["admin"],
    items: [
      {
        title: "Categories",
        url: "/admin/categories",
        icon: IconCategory,
        roles: ["admin"],
      },
      {
        title: "Users",
        url: "/admin/users",
        icon: IconUserSearch,
        roles: ["admin"],
      },
      {
        title: "Tasks",
        url: "/admin/tasks",
        icon: IconClipboard,
        roles: ["admin"],
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

    const filteredNavItems = React.useMemo(() => {
    if (!user) return [];

        const isAdmin = user.is_staff || user.is_superuser;

    const filterByRole = (item: NavConfigItem): boolean => {
      if (isAdmin && item.roles.includes("admin")) {
        return true;
      }
      if (user.role && item.roles.includes(user.role)) {
        return true;
      }
      return false;
    };

    return navConfig
      .filter(filterByRole)
      .map((item) => {
        if (hasChildren(item)) {
                    const filteredChildren = item.items.filter(filterByRole);
          if (filteredChildren.length === 0) return null;
          return {
            title: item.title,
            icon: item.icon,
            items: filteredChildren.map((child) => ({
              title: child.title,
              url: child.url,
              icon: child.icon,
            })),
          };
        }
        return {
          title: item.title,
          url: item.url,
          icon: item.icon,
        };
      })
      .filter(Boolean);
  }, [user]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="TrustSit"
                  className="size-6 rounded-md object-contain"
                />
                <span className="text-base font-semibold">TrustSit</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavItems as any} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
