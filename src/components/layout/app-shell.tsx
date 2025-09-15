
'use client';

import { usePathname } from 'next/navigation';
import { Sidebar, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';

const NO_LAYOUT_ROUTES = ['/sign-in', '/sign-up'];

function MainContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();

  return (
    <div
      className={cn(
        'flex-1 flex flex-col transition-all duration-300 ease-in-out',
        'md:group-data-[sidebar-open=true]:pl-[var(--sidebar-width)]',
        'md:group-data-[sidebar-open=false]:pl-[var(--sidebar-width-collapsed)]'
      )}
    >
      <Header />
      <main className="flex-1 bg-background text-foreground">
        {children}
      </main>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const showLayout = !NO_LAYOUT_ROUTES.includes(pathname);

  if (!showLayout) {
    return <>{children}</>;
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
