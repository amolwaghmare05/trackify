
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Goal } from '@/lib/types';
import { MyGoalsList } from '@/components/goals/my-goals-list';
import { useToast } from '@/hooks/use-toast';
import { AddGoalDialog } from '@/components/goals/add-goal-dialog';

export default function GoalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const goalsQuery = query(collection(db, 'goals'), where('userId', '==', user.uid));
      const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
        const goalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
        setGoals(goalsData);
      });

      return () => {
        unsubscribeGoals();
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
      setIsAddGoalDialogOpen(false);
    } catch (error) {
      console.error('Error adding goal: ', error);
      toast({ title: 'Failed to add goal.', variant: 'destructive' });
    }
  };
  
  const handleUpdateGoal = async (goalId: string, data: { title: string; targetDays: number }) => {
    try {
      await updateDoc(doc(db, 'goals', goalId), data);
      toast({ title: 'Goal updated successfully!' });
      setEditingGoal(undefined);
    } catch (error) {
      console.error('Error updating goal: ', error);
      toast({ title: 'Failed to update goal.', variant: 'destructive' });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteDoc(doc(db, 'goals', goalId));
      toast({ title: 'Goal deleted.' });
    } catch (error) {
      console.error('Error deleting goal: ', error);
      toast({ title: 'Failed to delete goal.', variant: 'destructive' });
    }
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const handleDialogSubmit = (data: { title: string; targetDays: number }) => {
    if (editingGoal) {
      handleUpdateGoal(editingGoal.id, data);
    } else {
      handleAddGoal(data);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEditingGoal(undefined);
      setIsAddGoalDialogOpen(false);
    } else {
      setIsAddGoalDialogOpen(true);
    }
  }


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
        <MyGoalsList 
          goals={goals}
          onAddGoal={() => setIsAddGoalDialogOpen(true)}
          onEditGoal={openEditDialog}
          onDeleteGoal={handleDeleteGoal}
        />
      </section>

      <AddGoalDialog
        isOpen={isAddGoalDialogOpen || !!editingGoal}
        onOpenChange={handleOpenChange}
        onAddGoal={handleDialogSubmit}
        goal={editingGoal}
      />
    </div>
  );
}
