
'use client';

import { usePathname } from 'next/navigation';
import { AppLayout } from './app-layout';

const NO_LAYOUT_ROUTES = ['/sign-in', '/sign-up'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showLayout = !NO_LAYOUT_ROUTES.includes(pathname);

  if (!showLayout) {
    return <>{children}</>;
  }

  return (
    <AppLayout>
        {children}
    </AppLayout>
  );
}
