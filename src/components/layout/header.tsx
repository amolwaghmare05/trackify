'use client';

import { Target, PlusCircle, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
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

interface HeaderProps {
  onAddGoal: () => void;
}

export function Header({ onAddGoal }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/sign-in');
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="flex items-center justify-between p-4 bg-card text-card-foreground border-b">
      <div className="flex items-center gap-2">
        <Target className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-primary">Trackify</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <Button onClick={onAddGoal} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        )}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
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
