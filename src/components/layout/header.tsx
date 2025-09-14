
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Target, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
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
import { calculateLevel } from '@/lib/levels';
import { UserBadge } from '../profile/user-badge';
import { cn } from '@/lib/utils';


function LiveClock() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on the client to avoid hydration mismatch
    setCurrentTime(new Date());

    // Update the time every second
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // 1000 milliseconds = 1 second

    // Clean up the interval on component unmount
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


export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userProfile = doc.data();
          const userLevel = calculateLevel(userProfile.xp ?? 0);
          setLevel(userLevel.level);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);


  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/sign-in');
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="flex h-16 items-center justify-between p-4 bg-card text-card-foreground border-b sticky top-0 z-30">
      <div className="flex items-center gap-2">
         <LiveClock />
      </div>
      <div className="flex items-center gap-4 ml-auto">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                     <UserBadge 
                        level={level}
                        className={cn(
                            "absolute bottom-0 right-0 h-4 w-4 transform translate-x-1/4 translate-y-1/4",
                            "border-2 border-card" 
                        )}
                     />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => router.push('/sign-in')} variant="ghost">
            <User className="h-5 w-5 mr-2" />
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
