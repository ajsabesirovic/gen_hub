import * as React from "react"
import { Link } from "react-router-dom"
import {
  IconCalendarCheck,
  IconListCheck,
  IconSettings,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react"

import { NavSecondary } from "@/components/sidebar/nav-secondary"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"

const data = {
  
  navCommunity: [
    {
      title: "Tasks",
      url: "/tasks",
      icon: IconListCheck,
    },
    {
      title: "Assignments",
      url: "/assignments",
      icon: IconUsers,
    },
    {
      title: "Availability",
      url: "/availability",
      icon: IconCalendarCheck,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: IconUserCircle,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    
  ],
  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="GenHub"
                  className="size-6 rounded-md object-contain"
                />
                <span className="text-base font-semibold">GenHub</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={[...data.navCommunity]} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
