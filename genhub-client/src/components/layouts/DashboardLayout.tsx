import { type ReactNode, type CSSProperties } from 'react';

import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SiteHeader } from '@/components/sidebar/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { NavigationProvider } from '@/contexts/NavigationContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const layoutStyle: CSSProperties = {
    ['--sidebar-width' as string]: 'calc(var(--spacing) * 72)',
    ['--header-height' as string]: 'calc(var(--spacing) * 12)',
  };

  return (
    <NavigationProvider>
    <SidebarProvider
      style={layoutStyle}
    >
      <AppSidebar variant="inset"/>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-6 md:gap-6 md:py-8 px-6 lg:px-8">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  </NavigationProvider>
  );
}


