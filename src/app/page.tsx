'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto flex h-full max-w-7xl items-center justify-center">
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center h-auto">
        <Target className="h-16 w-16 text-primary mb-4" />
        <h3 className="text-2xl font-bold tracking-tight font-headline">Welcome to Trackify, {user.displayName}!</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          Your personal dashboard is ready. Start by adding a goal.
        </p>
        <Button asChild>
          <Link href="/goals">Go to Goals</Link>
        </Button>
      </div>
    </div>
  );
}
