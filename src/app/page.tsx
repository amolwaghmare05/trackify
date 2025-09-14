
'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { DailyTask, Goal } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { WeeklyProgressChart } from '@/components/charts/weekly-progress-chart';
import { ConsistencyTrendChart } from '@/components/charts/consistency-trend-chart';
import { processTasksForCharts } from '@/lib/chart-utils';
import { TodayListCard } from '@/components/dashboard/today-list-card';
import { AIMotivation } from '@/components/dashboard/ai-motivation';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [chartData, setChartData] = useState<{
    weeklyProgress: {
        data: { day: string; 'Tasks Completed': number }[];
        yAxisMax: number;
    };
    consistencyTrend: { daily: any[]; weekly: any[] };
  } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // Fetch Goals
      const goalsQuery = query(collection(db, 'goals'), where('userId', '==', user.uid));
      const unsubscribeGoals = onSnapshot(goalsQuery, (querySnapshot) => {
        const userGoals: Goal[] = [];
        querySnapshot.forEach((doc) => {
          userGoals.push({ id: doc.id, ...doc.data() } as Goal);
        });
        setGoals(userGoals);
      });

      // Fetch Daily Tasks
      const tasksQuery = query(collection(db, 'dailyTasks'), where('userId', '==', user.uid));
      const unsubscribeTasks = onSnapshot(tasksQuery, (querySnapshot) => {
        const userTasks: DailyTask[] = [];
        querySnapshot.forEach((doc) => {
          userTasks.push({ id: doc.id, ...doc.data() } as DailyTask);
        });
        setTasks(userTasks);
        setChartData(processTasksForCharts(userTasks));
      });

      return () => {
        unsubscribeGoals();
        unsubscribeTasks();
      };
    } else {
      setTasks([]);
      setGoals([]);
      setChartData(null);
    }
  }, [user]);
  
  const goalsWithProgress = useMemo(() => {
    return goals.map(goal => {
      const relevantTasks = tasks.filter(task => task.goalId === goal.id && task.completed);
      const completedDays = new Set(relevantTasks.map(task => task.completedAt ? new Date((task.completedAt as any).seconds * 1000).toDateString() : '')).size;
      const progress = goal.targetDays > 0 ? Math.round((completedDays / goal.targetDays) * 100) : 0;
      return { ...goal, progress: Math.min(progress, 100), completedDays };
    });
  }, [goals, tasks]);

  const primaryGoal = useMemo(() => {
    // For now, let's just pick the first goal as the primary one for the AI
    return goalsWithProgress.length > 0 ? goalsWithProgress[0] : null;
  }, [goalsWithProgress]);

  const overallConsistency = useMemo(() => {
    if (!chartData) return 0;
    // Use the most recent weekly consistency score as the overall score
    const weeklyScores = chartData.consistencyTrend.weekly;
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
    <div className="container mx-auto py-8 space-y-8">
       <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Welcome back, {user.displayName}!</h1>
        <p className="text-muted-foreground">Here's a look at your progress and today's tasks.</p>
      </div>

      <TodayListCard />

      <AIMotivation
        userName={user.displayName || 'champion'}
        goal={primaryGoal?.title}
        progressPercentage={primaryGoal?.progress || 0}
        consistencyScore={overallConsistency}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {chartData && (
          <>
            <WeeklyProgressChart data={chartData.weeklyProgress} />
            <ConsistencyTrendChart data={chartData.consistencyTrend} />
          </>
        )}
      </div>
    </div>
  );
}
