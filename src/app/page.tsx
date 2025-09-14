'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { DailyTask } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { WeeklyProgressChart } from '@/components/charts/weekly-progress-chart';
import { ConsistencyTrendChart } from '@/components/charts/consistency-trend-chart';
import { processTasksForCharts } from '@/lib/chart-utils';
import { TodayListCard } from '@/components/dashboard/today-list-card';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
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
      const tasksQuery = query(collection(db, 'dailyTasks'), where('userId', '==', user.uid));
      const unsubscribeTasks = onSnapshot(tasksQuery, (querySnapshot) => {
        const userTasks: DailyTask[] = [];
        querySnapshot.forEach((doc) => {
          userTasks.push({ id: doc.id, ...doc.data() } as DailyTask);
        });
        setTasks(userTasks);
        setChartData(processTasksForCharts(userTasks));
      });

      return () => unsubscribeTasks();
    } else {
      setTasks([]);
      setChartData(null);
    }
  }, [user]);

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
