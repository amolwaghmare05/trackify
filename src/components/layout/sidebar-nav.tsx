'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Target as TargetIcon, Settings } from 'lucide-react';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Target } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/goals', label: 'Goals', icon: TargetIcon },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
    <SidebarHeader>
        <div className="flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-primary-foreground">Trackify</h1>
        </div>
    </SidebarHeader>
    <SidebarContent className="p-2">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
    <SidebarFooter className="p-2">
        <SidebarSeparator />
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" asChild>
                    <Link href="#">
                        <Settings />
                        <span>Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarFooter>
    </>
  );
}
