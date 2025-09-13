
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Goal, DailyTask } from '@/lib/types';
import { PlusCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddGoalDialog } from '@/components/goals/add-goal-dialog';
import { MyGoalsList } from '@/components/goals/my-goals-list';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { DailyTaskList } from '@/components/goals/daily-task-list';

export default function GoalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const goalsQuery = query(collection(db, 'goals'), where('userId', '==', user.uid));
      const tasksQuery = query(collection(db, 'dailyTasks'), where('userId', '==', user.uid));

      const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
        const goalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
        setGoals(goalsData);
      });

      const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyTask));
        setTasks(tasksData);
      });

      return () => {
        unsubscribeGoals();
        unsubscribeTasks();
      };
    }
  }, [user]);

  const handleAddGoal = async (data: { title: string; targetDays: number }) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'goals'), {
        userId: user.uid,
        title: data.title,
        targetDays: data.targetDays,
        progress: 0,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Goal added successfully!' });
    } catch (error) {
      console.error('Error adding goal: ', error);
      toast({ title: 'Failed to add goal.', variant: 'destructive' });
    }
  };
  
  const handleUpdateGoal = async (goalId: string, data: { title: string; targetDays: number }) => {
    try {
      await updateDoc(doc(db, 'goals', goalId), data);
      toast({ title: 'Goal updated successfully!' });
    } catch (error) {
      console.error('Error updating goal: ', error);
      toast({ title: 'Failed to update goal.', variant: 'destructive' });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      // First, delete all tasks associated with the goal
      const tasksQuery = query(collection(db, 'dailyTasks'), where('goalId', '==', goalId));
      const tasksSnapshot = await getDocs(tasksQuery);
      const batch = writeBatch(db);
      tasksSnapshot.forEach(taskDoc => {
        batch.delete(taskDoc.ref);
      });
      await batch.commit();

      // Then, delete the goal itself
      await deleteDoc(doc(db, 'goals', goalId));
      
      toast({ title: 'Goal and associated tasks deleted.' });
    } catch (error) {
      console.error('Error deleting goal and tasks: ', error);
      toast({ title: 'Failed to delete goal.', variant: 'destructive' });
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-full w-full flex-col items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section id="long-term-goals">
        {goals.length > 0 ? (
          <MyGoalsList 
            goals={goals}
            tasks={tasks}
            onAddGoal={() => setIsAddGoalDialogOpen(true)}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center h-auto">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold tracking-tight font-headline">Set Your First Long-Term Goal</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              What great accomplishment are you aiming for?
            </p>
            <Button onClick={() => setIsAddGoalDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          </div>
        )}
      </section>

      <Separator />

      <section id="daily-tasks">
        <DailyTaskList tasks={tasks} goals={goals} />
      </section>

      <AddGoalDialog
        isOpen={isAddGoalDialogOpen}
        onOpenChange={setIsAddGoalDialogOpen}
        onAddGoal={handleAddGoal}
      />
    </div>
  );
}
