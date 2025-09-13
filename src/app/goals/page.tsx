'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { Goal } from '@/lib/types';
import { MyGoalsList } from '@/components/goals/my-goals-list';

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'goals'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userGoals: Goal[] = [];
        querySnapshot.forEach((doc) => {
          userGoals.push({ id: doc.id, ...doc.data() } as Goal);
        });
        
        // Simple progress calculation (can be enhanced later)
        const updatedGoals = userGoals.map(goal => {
            const progress = goal.targetDays > 0 ? Math.round(( (goal.completedDays || 0) / goal.targetDays) * 100) : 0;
            return { ...goal, progress: Math.min(progress, 100) };
        });

        setGoals(updatedGoals);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleAddGoal = async (data: { title: string; targetDays: number }) => {
    if (user) {
      await addDoc(collection(db, 'goals'), {
        ...data,
        userId: user.uid,
        completedDays: 0,
        createdAt: new Date(),
      });
    }
  };

  const handleUpdateGoal = async (goalId: string, data: { title: string; targetDays: number }) => {
    const goalRef = doc(db, 'goals', goalId);
    await updateDoc(goalRef, data);
  };

  const handleDeleteGoal = async (goalId: string) => {
    await deleteDoc(doc(db, 'goals', goalId));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-8">
        <MyGoalsList
          goals={goals}
          onAddGoal={handleAddGoal}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
        />
      </div>
    </div>
  );
}
