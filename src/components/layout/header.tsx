'use client';

import { useState } from 'react';
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
import { AddGoalDialog } from '@/components/goals/add-goal-dialog';
import type { Goal } from '@/lib/types';

export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);

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

  const handleAddGoal = (newGoal: Omit<Goal, 'id' | 'isCompleted' | 'progress'>) => {
    // This is a placeholder. In a real application, you would handle this with a global state manager or by passing a function from a parent component.
    console.log("New Goal added in Header:", newGoal);
  };

  return (
    <header className="flex h-16 items-center justify-between p-4 bg-card text-card-foreground border-b sticky top-0 z-30">
      <div className="flex items-center gap-2">
         <Target className="h-7 w-7 text-primary" />
         <h1 className="text-2xl font-bold font-headline text-primary-foreground">Trackify</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={() => setIsAddGoalDialogOpen(true)} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
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
      <AddGoalDialog 
        isOpen={isAddGoalDialogOpen} 
        onOpenChange={setIsAddGoalDialogOpen}
        onAddGoal={handleAddGoal} 
      />
    </header>
  );
}
