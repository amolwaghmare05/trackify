
'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { UserProfile, DailyTaskHistory, WorkoutHistory } from '@/lib/types';
import { updateProfile } from 'firebase/auth';
import { UserInformationCard } from '@/components/profile/user-information-card';
import { StatisticsCard } from '@/components/profile/statistics-card';
import { calculateLevel } from '@/lib/levels';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    goalsCompleted: 0,
    dailyTasksDone: 0,
    workoutsDone: 0,
  });

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserProfile({ uid: doc.id, ...doc.data() } as UserProfile);
        } else {
          setUserProfile(null);
        }
      });

      const fetchStats = async () => {
        // 1. Goals Completed
        const completedGoalsQuery = query(collection(db, 'users', user.uid, 'completedGoals'));
        const completedGoalsSnapshot = await getDocs(completedGoalsQuery);
        const goalsCompleted = completedGoalsSnapshot.size;

        // 2. Daily Tasks Done (from history)
        const dailyHistoryQuery = query(collection(db, 'users', user.uid, 'dailyTaskHistory'));
        const dailyHistorySnapshot = await getDocs(dailyHistoryQuery);
        const dailyTasksDone = dailyHistorySnapshot.docs.reduce((sum, doc) => {
            const history = doc.data() as DailyTaskHistory;
            return sum + (history.completed || 0);
        }, 0);

        // 3. Workouts Done (from history)
        const workoutHistoryQuery = query(collection(db, 'users', user.uid, 'workoutHistory'));
        const workoutHistorySnapshot = await getDocs(workoutHistoryQuery);
        const workoutsDone = workoutHistorySnapshot.docs.reduce((sum, doc) => {
            const history = doc.data() as WorkoutHistory;
            return sum + (history.completed || 0);
        }, 0);
        
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
            toast({
                title: 'Success!',
                description: 'Your name has been updated.',
            });
        } catch (error) {
            console.error("Error updating display name: ", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update your name. Please try again.',
            });
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

  const userLevel = calculateLevel(userProfile?.xp ?? 0);

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <UserInformationCard 
                user={user}
                onUpdateName={handleUpdateName}
                level={userLevel.level}
            />
        </div>
        <div className="lg:col-span-2">
            <StatisticsCard 
                xp={userProfile?.xp ?? 0}
                level={userLevel}
                goalsCompleted={stats.goalsCompleted}
                dailyTasksDone={stats.dailyTasksDone}
                workoutsDone={stats.workoutsDone}
            />
        </div>
      </div>
    </div>
  );
}
