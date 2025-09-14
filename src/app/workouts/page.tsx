'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { Workout } from '@/lib/types';
import { WorkoutTrackerCard } from '@/components/workouts/workout-tracker-card';

export default function WorkoutsPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const workoutsQuery = query(collection(db, 'workouts'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(workoutsQuery, (querySnapshot) => {
        const userWorkouts: Workout[] = [];
        querySnapshot.forEach((doc) => {
          userWorkouts.push({ id: doc.id, ...doc.data() } as Workout);
        });
        setWorkouts(userWorkouts);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setWorkouts([]);
      setLoading(false);
    }
  }, [user]);

  const handleAddWorkout = async (title: string) => {
    if (!user) return;
    await addDoc(collection(db, 'workouts'), {
      title,
      userId: user.uid,
      completed: false,
      streak: 0,
      completedAt: null,
      createdAt: new Date(),
    });
  };

  const handleUpdateWorkout = async (workoutId: string, data: Partial<Workout>) => {
    const workoutRef = doc(db, 'workouts', workoutId);
    await updateDoc(workoutRef, data);
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    await deleteDoc(doc(db, 'workouts', workoutId));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <WorkoutTrackerCard
        workouts={workouts}
        onAddWorkout={handleAddWorkout}
        onUpdateWorkout={handleUpdateWorkout}
        onDeleteWorkout={handleDeleteWorkout}
      />
    </div>
  );
}
