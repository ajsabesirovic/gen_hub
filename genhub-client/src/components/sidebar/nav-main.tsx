import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon?: Icon | LucideIcon;
  isActive?: boolean;
};

type NavItemWithChildren = {
  title: string;
  icon?: Icon | LucideIcon;
  isActive?: boolean;
  items: NavItem[];
};

type NavConfigItem = NavItem | NavItemWithChildren;

function isNavItemWithChildren(
  item: NavConfigItem,
): item is NavItemWithChildren {
  return "items" in item && Array.isArray(item.items);
}

export function NavMain({ items }: { items: NavConfigItem[] }) {
  const location = useLocation();

  const isRouteActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const isGroupActive = (subitems: NavItem[]) => {
    return subitems.some((item) => isRouteActive(item.url));
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            if (isNavItemWithChildren(item)) {
                            return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isGroupActive(item.items)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isRouteActive(subItem.url)}
                            >
                              <NavLink to={subItem.url}>
                                {subItem.icon && <subItem.icon />}
                                <span>{subItem.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

                        return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isRouteActive(item.url)}
                >
                  <NavLink to={item.url} className="flex items-center gap-2">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
