
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Target as TargetIcon, Settings, User, Dumbbell, Trophy, BarChartHorizontal } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/goals', label: 'Goals', icon: TargetIcon },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/reports', label: 'Reports', icon: BarChartHorizontal },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();


  return (
    <>
    <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold font-headline text-sidebar-foreground">Trackify</h1>
              <p className="text-xs text-sidebar-foreground/70">Your Goal Companion</p>
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
    <SidebarFooter className="p-4 border-t border-sidebar-border">
      {user ? (
        <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-medium leading-tight truncate text-sidebar-foreground">{user.displayName}</p>
                <p className="text-xs leading-tight text-sidebar-foreground/70 truncate">{user.email}</p>
            </div>
        </div>
      ) : (
        <Button variant="outline" className="w-full bg-sidebar-accent" onClick={() => router.push('/sign-in')}>
            <User className="mr-2 h-4 w-4" />
            Sign In
        </Button>
      )}
    </SidebarFooter>
    </>
  );
}
