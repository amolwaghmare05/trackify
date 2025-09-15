
'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { Goal, DailyTaskHistory } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { WeeklyProgressChart } from '@/components/charts/weekly-progress-chart';
import { ConsistencyTrendChart } from '@/components/charts/consistency-trend-chart';
import { processTasksForCharts } from '@/lib/chart-utils';
import { TodayListCard } from '@/components/dashboard/today-list-card';
import { AIMotivation } from '@/components/dashboard/ai-motivation';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [history, setHistory] = useState<DailyTaskHistory[]>([]);

  const chartData = useMemo(() => processTasksForCharts(history), [history]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const goalsQuery = query(collection(db, 'users', user.uid, 'goals'));
      const unsubscribeGoals = onSnapshot(goalsQuery, (querySnapshot) => {
        const userGoals: Goal[] = [];
        querySnapshot.forEach((doc) => {
          userGoals.push({ id: doc.id, ...doc.data() } as Goal);
        });
        setGoals(userGoals);
      });

      const historyQuery = query(collection(db, 'users', user.uid, 'dailyTaskHistory'));
      const unsubscribeHistory = onSnapshot(historyQuery, (querySnapshot) => {
        const userHistory: DailyTaskHistory[] = [];
        querySnapshot.forEach((doc) => {
          userHistory.push({ id: doc.id, ...doc.data() } as DailyTaskHistory);
        });
        setHistory(userHistory);
      });

      return () => {
        unsubscribeGoals();
        unsubscribeHistory();
      };
    } else {
      setGoals([]);
      setHistory([]);
    }
  }, [user]);
  
  const goalsWithProgress = useMemo(() => {
    return goals.map(goal => {
      const progress = goal.targetDays > 0 ? Math.round((goal.completedDays / goal.targetDays) * 100) : 0;
      return { ...goal, progress: Math.min(progress, 100) };
    });
  }, [goals]);

  const primaryGoal = useMemo(() => {
    return goalsWithProgress.length > 0 ? goalsWithProgress[0] : null;
  }, [goalsWithProgress]);

  const overallConsistency = useMemo(() => {
    const weeklyScores = chartData?.consistencyTrend.weekly || [];
    return weeklyScores.length > 0 ? weeklyScores[weeklyScores.length - 1].consistency : 0;
  }, [chartData]);


  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
  <div className="container mx-auto px-2 py-4 sm:px-4 md:px-8 md:py-8 space-y-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Welcome back, {user.displayName}!</h1>
        <p className="text-muted-foreground">Here's a look at your progress and today's tasks.</p>
      </div>
      {/* Top row: Today's List and AI Coach side by side */}
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr] gap-6 md:gap-8 mb-8">
        <TodayListCard />
        <AIMotivation
          userName={user.displayName || 'champion'}
          goal={primaryGoal?.title}
          progressPercentage={primaryGoal?.progress || 0}
          consistencyScore={overallConsistency}
        />
      </div>
      {/* Bottom row: Weekly Progress and Consistency Trend charts side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <WeeklyProgressChart data={chartData.weeklyProgress} />
        <ConsistencyTrendChart data={chartData.consistencyTrend} />
      </div>
    </div>
  );
}
