
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Target as TargetIcon, Settings, User, Dumbbell, Trophy, BarChartHorizontal } from 'lucide-react';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Target } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/goals', label: 'Goals', icon: TargetIcon },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/reports', label: 'Reports', icon: BarChartHorizontal },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
    <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold font-headline">Triumph Track</h1>
              <p className="text-xs text-muted-foreground">Your Goal Companion</p>
            </div>
        </div>
    </SidebarHeader>
    <SidebarContent className="p-4 flex-grow">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
              className="text-base font-medium"
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
    </>
  );
}
