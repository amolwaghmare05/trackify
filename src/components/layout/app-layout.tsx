
'use client';

import { Sidebar, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import * as React from 'react';

function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex-1 flex flex-col transition-all duration-300 ease-in-out',
        'md:group-data-[sidebar-open=true]:pl-[var(--sidebar-width)] md:group-data-[sidebar-open=false]:pl-[var(--sidebar-width-collapsed)]'
      )}
    >
      <Header />
      <main className="flex-1 bg-background text-foreground">
        {children}
      </main>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <SidebarProvider>
            <div className="relative flex min-h-screen">
                <Sidebar>
                <SidebarNav />
                </Sidebar>
                <MainContent>
                {children}
                </MainContent>
            </div>
        </SidebarProvider>
    );
}
