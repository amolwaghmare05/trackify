'use client';

import { usePathname } from 'next/navigation';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';

const NO_LAYOUT_ROUTES = ['/sign-in', '/sign-up'];

export function AppLayout({ children }: { children: React.ReactNode }) {
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
        <div className="flex-1 flex flex-col ml-[var(--sidebar-width)]">
          <Header />
          <main className="flex-1 p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
