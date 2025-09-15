
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { DailyTaskHistory, WorkoutHistory, CompletedGoal, ReportsPageData } from '@/lib/types';
import { processHistoryForReports } from '@/lib/report-utils';
import { BarChartHorizontal } from 'lucide-react';
import { ActivityBreakdownChart } from '@/components/reports/activity-breakdown-chart';
import { TaskConsistencyChart } from '@/components/reports/task-consistency-chart';
import { WorkoutDisciplineChart as MonthlyWorkoutDisciplineChart } from '@/components/reports/workout-discipline-chart'; // Renamed to avoid conflict
import { Skeleton } from '@/components/ui/skeleton';


export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const [reportData, setReportData] = useState<ReportsPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);

        const taskHistoryQuery = query(collection(db, 'users', user.uid, 'dailyTaskHistory'));
        const workoutHistoryQuery = query(collection(db, 'users', user.uid, 'workoutHistory'));
        const completedGoalsQuery = query(collection(db, 'users', user.uid, 'completedGoals'));

        const [taskHistorySnapshot, workoutHistorySnapshot, completedGoalsSnapshot] = await Promise.all([
          getDocs(taskHistoryQuery),
          getDocs(workoutHistoryQuery),
          getDocs(completedGoalsQuery),
        ]);

        const taskHistory = taskHistorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyTaskHistory));
        const workoutHistory = workoutHistorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutHistory));
        const completedGoals = completedGoalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CompletedGoal));
        
        const processedData = processHistoryForReports(taskHistory, workoutHistory, completedGoals);
        setReportData(processedData);
        setLoading(false);
      };

      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
             <div className="mb-8 flex items-center gap-3">
                <BarChartHorizontal className="h-8 w-8 text-foreground" />
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">An overview of your long-term progress and activity.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-[450px] w-full" />
                <Skeleton className="h-[450px] w-full" />
                <Skeleton className="h-[450px] w-full" />
                <Skeleton className="h-[450px] w-full lg:col-span-2" />
            </div>
        </div>
    );
  }

  if (!reportData) {
    return (
        <div className="container mx-auto p-4 md:p-8">
             <div className="mb-8 flex items-center gap-3">
                <BarChartHorizontal className="h-8 w-8 text-foreground" />
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">An overview of your long-term progress and activity.</p>
                </div>
            </div>
            <p className="text-center text-muted-foreground py-16">No data available to generate reports yet. Start completing tasks and workouts!</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8 flex items-center gap-3">
        <BarChartHorizontal className="h-8 w-8 text-foreground" />
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Reports</h1>
            <p className="text-muted-foreground">An overview of your long-term progress and activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TaskConsistencyChart data={reportData.taskConsistency} />
        <MonthlyWorkoutDisciplineChart data={reportData.workoutDiscipline} />
        <ActivityBreakdownChart data={reportData.activityBreakdown} />
        <div className="lg:col-span-2">
      {/* XP Growth Chart removed as requested */}
        </div>
      </div>
    </div>
  );
}
