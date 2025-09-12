
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Goal } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { GoalCard } from '@/components/goals/goal-card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddGoalDialog } from '@/components/goals/add-goal-dialog';
import { Trophy } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);

  useEffect(() => {
    // Only redirect if loading is complete and there's no user.
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);


  // Hydration fix for initial data
  useEffect(() => {
    if (user) {
      setGoals([
        {
          id: '1',
          title: 'Learn Next.js',
          description: 'Complete a comprehensive course and build a project.',
          targetDate: new Date('2024-12-31'),
          progress: 25,
          isCompleted: false,
        },
        {
          id: '2',
          title: 'Run a 5k',
          description: 'Train consistently and participate in a local 5k race.',
          targetDate: new Date('2024-09-30'),
          progress: 60,
          isCompleted: false,
        },
        {
          id: '3',
          title: 'Read 12 Books',
          description: 'Finish one book per month for the rest of the year.',
          targetDate: new Date('2024-12-31'),
          progress: 50,
          isCompleted: false,
        },
        {
          id: '4',
          title: 'Meditate Daily',
          description: 'Practice mindfulness for 10 minutes every day.',
          targetDate: new Date('2024-08-31'),
          progress: 90,
          isCompleted: true,
          completedAt: new Date('2024-07-20'),
        },
      ]);
    }
  }, [user]);

  const handleAddGoal = (newGoal: Omit<Goal, 'id' | 'isCompleted' | 'progress'>) => {
    setGoals(prevGoals => [
      ...prevGoals,
      { ...newGoal, id: Date.now().toString(), isCompleted: false, progress: 0 },
    ]);
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(prevGoals =>
      prevGoals.map(goal => (goal.id === updatedGoal.id ? updatedGoal : goal))
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
  };

  const activeGoals = useMemo(() => goals.filter(g => !g.isCompleted).sort((a,b) => a.targetDate.getTime() - b.targetDate.getTime()), [goals]);
  const completedGoals = useMemo(() => goals.filter(g => g.isCompleted).sort((a,b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0)), [goals]);
  
  // Display loading indicator while auth state is being determined.
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  // If not loading and still no user, the useEffect will handle the redirect.
  // We can return null or a minimal layout to avoid a flash of content.
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header onAddGoal={() => setIsAddGoalDialogOpen(true)} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center h-[400px]">
              <h3 className="text-2xl font-bold tracking-tight font-headline">You have no goals yet.</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Get started by creating your first goal. What will you achieve?
              </p>
              <Button onClick={() => setIsAddGoalDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create First Goal
              </Button>
            </div>
          ) : (
            <>
              <section id="active-goals">
                <h2 className="text-2xl font-bold font-headline mb-4">Active Goals</h2>
                {activeGoals.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeGoals.map(goal => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onUpdate={handleUpdateGoal}
                        onDelete={handleDeleteGoal}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground p-8 bg-card rounded-lg">
                    <p>No active goals. Add a new one to get started!</p>
                  </div>
                )}
              </section>

              {completedGoals.length > 0 && (
                <section id="completed-goals" className="mt-12">
                  <h2 className="text-2xl font-bold font-headline mb-4 flex items-center">
                    <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
                    Completed Goals
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {completedGoals.map(goal => (
                       <GoalCard
                        key={goal.id}
                        goal={goal}
                        onUpdate={handleUpdateGoal}
                        onDelete={handleDeleteGoal}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <AddGoalDialog 
        isOpen={isAddGoalDialogOpen} 
        onOpenChange={setIsAddGoalDialogOpen}
        onAddGoal={handleAddGoal} 
      />
    </div>
  );
}
