'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { Goal, DailyTask } from '@/lib/types';
import { MyGoalsList } from '@/components/goals/my-goals-list';
import { DailyTaskList } from '@/components/goals/daily-task-list';
import { WeeklyProgressChart } from '@/components/charts/weekly-progress-chart';
import { ConsistencyTrendChart } from '@/components/charts/consistency-trend-chart';
import { processTasksForCharts } from '@/lib/chart-utils';

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{
    weeklyProgress: {
        data: { day: string; 'Tasks Completed': number }[];
        yAxisMax: number;
    };
    consistencyTrend: { daily: any[]; weekly: any[] };
  } | null>(null);


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
        setLoading(false);
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
      setGoals([]);
      setTasks([]);
      setLoading(false);
      setChartData(null);
    }
  }, [user]);

  const goalsWithProgress = useMemo(() => {
    if (!goals || goals.length === 0) {
      return [];
    }
    return goals.map(goal => {
      const relevantTasks = tasks.filter(task => task.goalId === goal.id && task.completed);
      const completedDays = new Set(relevantTasks.map(task => task.completedAt ? new Date(task.completedAt.seconds * 1000).toDateString() : '')).size;
      const progress = goal.targetDays > 0 ? Math.round((completedDays / goal.targetDays) * 100) : 0;
      return { ...goal, progress: Math.min(progress, 100), completedDays };
    });
  }, [goals, tasks]);


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
    const batch = writeBatch(db);

    // Delete the goal
    const goalRef = doc(db, 'goals', goalId);
    batch.delete(goalRef);

    // Find and delete all associated tasks
    const tasksToDelete = tasks.filter(task => task.goalId === goalId);
    tasksToDelete.forEach(task => {
        const taskRef = doc(db, 'dailyTasks', task.id);
        batch.delete(taskRef);
    });

    await batch.commit();
  };

  const handleAddTask = (data: { title: string; goalId: string }) => {
    if (!user) return;
    addDoc(collection(db, 'dailyTasks'), {
      ...data,
      userId: user.uid,
      completed: false,
      streak: 0,
      completedAt: null,
      createdAt: new Date(),
    });
  };

  const handleUpdateTask = async (taskId: string, data: Partial<DailyTask>) => {
    const taskRef = doc(db, 'dailyTasks', taskId);
    await updateDoc(taskRef, data);
  };
  
  const handleDeleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, 'dailyTasks', taskId));
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <MyGoalsList
        goals={goalsWithProgress}
        onAddGoal={handleAddGoal}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
      />
      <DailyTaskList
        tasks={tasks}
        goals={goalsWithProgress}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />
       {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <WeeklyProgressChart data={chartData.weeklyProgress} />
            <ConsistencyTrendChart data={chartData.consistencyTrend} />
        </div>
        )}
    </div>
  );
}
