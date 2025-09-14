'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { UserProfile, Goal, DailyTask, Workout } from '@/lib/types';
import { updateProfile } from 'firebase/auth';
import { UserInformationCard } from '@/components/profile/user-information-card';
import { StatisticsCard } from '@/components/profile/statistics-card';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    goalsCompleted: 0,
    dailyTasksDone: 0,
    workoutsDone: 0,
  });

  useEffect(() => {
    if (user) {
      // Listen to user profile document
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserProfile({ uid: doc.id, ...doc.data() } as UserProfile);
        } else {
            // Handle case where user profile doesn't exist yet, though it should for logged-in users.
            setUserProfile(null);
        }
      });

      // Fetch aggregate stats
      const fetchStats = async () => {
        // Goals Completed (assuming a 'status' field or similar)
        const goalsQuery = query(collection(db, 'goals'), where('userId', '==', user.uid), where('progress', '>=', 100));
        const goalsSnapshot = await getDocs(goalsQuery);
        const goalsCompleted = goalsSnapshot.size;

        // Daily Tasks Done
        const tasksQuery = query(collection(db, 'dailyTasks'), where('userId', '==', user.uid), where('completed', '==', true));
        const tasksSnapshot = await getDocs(tasksQuery);
        const dailyTasksDone = tasksSnapshot.size;

        // Workouts Done
        const workoutsQuery = query(collection(db, 'workouts'), where('userId', '==', user.uid), where('completed', '==', true));
        const workoutsSnapshot = await getDocs(workoutsQuery);
        const workoutsDone = workoutsSnapshot.size;
        
        setStats({ goalsCompleted, dailyTasksDone, workoutsDone });
      };

      fetchStats();

      return () => {
        unsubscribeProfile();
      };
    }
  }, [user]);
  
  const handleUpdateName = async (newName: string) => {
    if (user && newName.trim() !== '') {
        try {
            await updateProfile(user, { displayName: newName });
            // The auth context will update automatically. 
            // We can force a re-render or rely on the listener.
            // For immediate feedback, we can update the local state if needed.
        } catch (error) {
            console.error("Error updating display name: ", error);
        }
    }
  };

  if (loading || !user) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <UserInformationCard 
                user={user}
                onUpdateName={handleUpdateName}
            />
        </div>
        <div className="lg:col-span-2">
            <StatisticsCard 
                xp={userProfile?.xp ?? 0}
                goalsCompleted={stats.goalsCompleted}
                dailyTasksDone={stats.dailyTasksDone}
                workoutsDone={stats.workoutsDone}
            />
        </div>
      </div>
    </div>
  );
}
