
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  runTransaction,
  writeBatch,
  increment,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { Workout, WorkoutHistory } from '@/lib/types';
import { WorkoutTrackerCard } from '@/components/workouts/workout-tracker-card';
import { WorkoutDisciplineChart } from '@/components/workouts/workout-discipline-chart';
import { processWorkoutsForChart } from '@/lib/chart-utils';
import { format } from 'date-fns';

export default function WorkoutsPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const chartData = useMemo(() => processWorkoutsForChart(history), [history]);

  useEffect(() => {
    if (user) {
      const workoutsQuery = query(collection(db, 'users', user.uid, 'workouts'));
      const unsubscribeWorkouts = onSnapshot(workoutsQuery, (querySnapshot) => {
        const userWorkouts: Workout[] = [];
        querySnapshot.forEach((doc) => {
          userWorkouts.push({ id: doc.id, ...doc.data() } as Workout);
        });
        setWorkouts(userWorkouts);
        if (loading) setLoading(false);
      });

      const historyQuery = query(collection(db, 'users', user.uid, 'workoutHistory'));
      const unsubscribeHistory = onSnapshot(historyQuery, (querySnapshot) => {
        const userHistory: WorkoutHistory[] = [];
        querySnapshot.forEach((doc) => {
          userHistory.push({ id: doc.id, ...doc.data() } as WorkoutHistory);
        });
        setHistory(userHistory);
      });

      return () => {
        unsubscribeWorkouts();
        unsubscribeHistory();
      };
    } else {
      setWorkouts([]);
      setHistory([]);
      setLoading(false);
    }
  }, [user, loading]);

  const handleAddWorkout = async (title: string) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'workouts'), {
      title,
      userId: user.uid,
      completed: false,
      streak: 0,
      completedAt: null,
      createdAt: new Date(),
    });
  };

  const handleUpdateWorkout = async (workout: Workout, isCompleted: boolean) => {
    if (!user) return;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const historyDocRef = doc(db, 'users', user.uid, 'workoutHistory', todayStr);
    const workoutRef = doc(db, 'users', user.uid, 'workouts', workout.id);
    const userRef = doc(db, 'users', user.uid);

    try {
        await runTransaction(db, async (transaction) => {
            const workoutDoc = await transaction.get(workoutRef);
            if (!workoutDoc.exists()) return;

            // Update workout
            let newStreak = workout.streak || 0;
            if (isCompleted && !workout.completed) {
                newStreak++;
            } else if (!isCompleted && workout.completed) {
                newStreak = Math.max(0, newStreak - 1);
            }
            transaction.update(workoutRef, { 
                completed: isCompleted,
                streak: newStreak,
                completedAt: isCompleted ? new Date() : null 
            });
            
            // Grant/remove XP
            if (isCompleted !== workout.completed) {
                transaction.set(userRef, { xp: increment(isCompleted ? 10 : -10) }, { merge: true });
            }

            // Update history
            const allWorkoutsQuery = query(collection(db, 'users', user.uid, 'workouts'));
            const allWorkoutsSnapshot = await getDocs(allWorkoutsQuery);
            const totalWorkouts = allWorkoutsSnapshot.size;
            const completedWorkouts = allWorkoutsSnapshot.docs.filter(doc => {
              if (doc.id === workout.id) return isCompleted;
              return doc.data().completed;
            }).length;

            transaction.set(historyDocRef, {
                date: Timestamp.fromDate(new Date()),
                completed: completedWorkouts,
                total: totalWorkouts,
            }, { merge: true });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!user) return;

    const workoutToDelete = workouts.find(w => w.id === workoutId);
    if (!workoutToDelete) return;

    const batch = writeBatch(db);
    const workoutRef = doc(db, 'users', user.uid, 'workouts', workoutId);
    batch.delete(workoutRef);

    // If the deleted workout was completed, remove its XP
    if (workoutToDelete.completed) {
        const userRef = doc(db, 'users', user.uid);
        batch.update(userRef, { xp: increment(-10) });
    }

    await batch.commit();

    // After deleting, we need to update today's history
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const historyDocRef = doc(db, 'users', user.uid, 'workoutHistory', todayStr);
    const remainingWorkouts = workouts.filter(w => w.id !== workoutId);
    
    await updateDoc(historyDocRef, {
        total: remainingWorkouts.length,
        completed: remainingWorkouts.filter(w => w.completed).length
    });
  };

  if (loading) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <WorkoutTrackerCard
        workouts={workouts}
        onAddWorkout={handleAddWorkout}
        onUpdateWorkout={handleUpdateWorkout}
        onDeleteWorkout={handleDeleteWorkout}
      />
      {chartData && <WorkoutDisciplineChart data={chartData} />}
    </div>
  );
}
