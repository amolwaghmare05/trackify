
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppLayout } from './app-layout';

const NO_LAYOUT_ROUTES = ['/sign-in', '/sign-up'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showLayout = !NO_LAYOUT_ROUTES.includes(pathname);

  if (!showLayout) {
    return <>{children}</>;
  }

  // Render a loader or null on the server and initial client render to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <AppLayout>
        {children}
    </AppLayout>
  );
}
