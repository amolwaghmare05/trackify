
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, writeBatch, runTransaction, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { Goal, DailyTask } from '@/lib/types';
import { MyGoalsList } from '@/components/goals/my-goals-list';
import { DailyTaskList } from '@/components/goals/daily-task-list';
import { WeeklyProgressChart } from '@/components/charts/weekly-progress-chart';
import { ConsistencyTrendChart } from '@/components/charts/consistency-trend-chart';
import { processTasksForCharts } from '@/lib/chart-utils';

async function completeGoal(goal: Goal) {
    if (!goal || !goal.userId || !goal.id) return;

    const completedGoalRef = doc(collection(db, 'completedGoals'));
    const originalGoalRef = doc(db, 'goals', goal.id);

    try {
        await runTransaction(db, async (transaction) => {
            const originalDoc = await transaction.get(originalGoalRef);
            // Only proceed if the original goal still exists
            if (!originalDoc.exists()) {
                return;
            }

            transaction.set(completedGoalRef, {
                userId: goal.userId,
                title: goal.title,
                targetDays: goal.targetDays,
                completedAt: new Date(),
                originalCreatedAt: goal.createdAt,
            });
            transaction.delete(originalGoalRef);
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
    }
}

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{
    weeklyProgress: { data: any[]; yAxisMax: number; };
    consistencyTrend: { daily: any[]; weekly: any[]; };
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
    return goals.map(goal => {
      const progress = goal.targetDays > 0 ? Math.round((goal.completedDays / goal.targetDays) * 100) : 0;
      const finalProgress = Math.min(progress, 100);
      return { ...goal, progress: finalProgress };
    });
  }, [goals]);
  
  useEffect(() => {
    goalsWithProgress.forEach(goal => {
      if (goal.progress >= 100) {
        completeGoal(goal);
      }
    });
  }, [goalsWithProgress]);


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

  const handleUpdateTask = async (task: DailyTask, isCompleted: boolean) => {
    const taskRef = doc(db, 'dailyTasks', task.id);
    const goalRef = doc(db, 'goals', task.goalId);

    const batch = writeBatch(db);

    let newStreak = task.streak || 0;
    if (isCompleted) {
      newStreak++;
    } else {
      newStreak = Math.max(0, newStreak - 1);
    }
    
    batch.update(taskRef, { 
      completed: isCompleted,
      streak: newStreak,
      completedAt: isCompleted ? new Date() : null 
    });

    batch.update(goalRef, {
      completedDays: increment(isCompleted ? 1 : -1)
    });

    await batch.commit();
  };
  
  const handleDeleteTask = async (taskId: string) => {
    // Before deleting, check if the task was completed to decrement the goal's completedDays
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (taskToDelete && taskToDelete.completed) {
      const goalRef = doc(db, 'goals', taskToDelete.goalId);
      await updateDoc(goalRef, {
        completedDays: increment(-1)
      });
    }
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {chartData ? (
          <>
            <WeeklyProgressChart data={chartData.weeklyProgress} />
            <ConsistencyTrendChart data={chartData.consistencyTrend} />
          </>
        ) : (
          <>
            <WeeklyProgressChart data={{ data: [], yAxisMax: 5 }} />
            <ConsistencyTrendChart data={{ daily: [], weekly: [] }} />
          </>
        )}
      </div>
    </div>
  );
}
