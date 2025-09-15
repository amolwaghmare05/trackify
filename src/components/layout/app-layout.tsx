
'use client';

import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import * as React from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="relative flex min-h-screen">
                <Sidebar>
                    <SidebarNav />
                </Sidebar>
                <div
                    className={cn(
                        'flex-1 flex flex-col transition-all duration-300 ease-in-out',
                        'md:pl-[var(--sidebar-width-collapsed)] group-data-[sidebar-open=true]/sidebar-wrapper:md:pl-[var(--sidebar-width)]'
                    )}
                >
                    <Header />
                    <main className="flex-1 bg-background text-foreground">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
