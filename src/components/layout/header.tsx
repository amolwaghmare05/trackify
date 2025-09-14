
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Settings as SettingsIcon, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { doc, onSnapshot } from 'firebase/firestore';
import { calculateLevel, getLevelDetails } from '@/lib/levels';

function LiveClock() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (!currentTime) {
    return (
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Skeleton className="h-4 w-48" />
        </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3 text-sm font-medium text-muted-foreground">
      <span>{format(currentTime, 'eeee, MMMM do, yyyy')}</span>
      <Separator orientation="vertical" className="h-4" />
      <span>{format(currentTime, 'h:mm a')}</span>
    </div>
  );
}

function LevelAvatar({ level, className }: { level: number; className?: string }) {
    const levelInfo = getLevelDetails(level);
    const Icon = levelInfo.icon;
    return (
        <Avatar className={className}>
            <AvatarFallback
                className="flex items-center justify-center"
                style={{ backgroundColor: levelInfo.color, color: '#FFF' }}
            >
                <Icon className="h-5 w-5" />
            </AvatarFallback>
        </Avatar>
    );
}

export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const [userLevel, setUserLevel] = useState<ReturnType<typeof calculateLevel> | null>(null);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userProfile = doc.data();
          setUserLevel(calculateLevel(userProfile.xp ?? 0));
        } else {
          setUserLevel(calculateLevel(0));
        }
      });
      return () => unsubscribe();
    }
  }, [user]);


  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/sign-in');
  };
  
  return (
    <header className="flex h-16 items-center justify-between px-4 sm:px-6 bg-card text-card-foreground border-b sticky top-0 z-30">
      <div className="flex items-center gap-2">
         <LiveClock />
      </div>
      <div className="flex items-center gap-4 ml-auto">
        {user && userLevel ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 h-auto px-2 py-1">
                    <LevelAvatar level={userLevel.level} className="h-9 w-9" />
                    <div className="hidden sm:flex flex-col items-start">
                        <span className="font-medium text-sm">{user.displayName || 'User'}</span>
                        <span className="text-xs text-muted-foreground">{userLevel.name}</span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 <Link href="/settings">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Skeleton className="h-9 w-32" />
        )}
      </div>
    </header>
  );
}
