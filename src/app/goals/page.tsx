
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, writeBatch, runTransaction, increment, getDocs, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { Goal, DailyTask, DailyTaskHistory } from '@/lib/types';
import { MyGoalsList } from '@/components/goals/my-goals-list';
import { DailyTaskList } from '@/components/goals/daily-task-list';
import { format } from 'date-fns';
import { WeeklyProgressChart } from '@/components/charts/weekly-progress-chart';
import { ConsistencyTrendChart } from '@/components/charts/consistency-trend-chart';
import { processTasksForCharts } from '@/lib/chart-utils';

async function completeGoal(goal: Goal) {
    if (!goal || !goal.userId || !goal.id) return;

    const completedGoalRef = doc(collection(db, 'users', goal.userId, 'completedGoals'));
    const originalGoalRef = doc(db, 'users', goal.userId, 'goals', goal.id);

    try {
        await runTransaction(db, async (transaction) => {
            const originalDoc = await transaction.get(originalGoalRef);
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
  const [history, setHistory] = useState<DailyTaskHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const chartData = useMemo(() => processTasksForCharts(history), [history]);

  useEffect(() => {
    if (user) {
      const goalsQuery = query(collection(db, 'users', user.uid, 'goals'));
      const unsubscribeGoals = onSnapshot(goalsQuery, (querySnapshot) => {
        const userGoals: Goal[] = [];
        querySnapshot.forEach((doc) => {
          userGoals.push({ id: doc.id, ...doc.data() } as Goal);
        });
        setGoals(userGoals);
        if(loading) setLoading(false);
      });

      const tasksQuery = query(collection(db, 'users', user.uid, 'dailyTasks'));
      const unsubscribeTasks = onSnapshot(tasksQuery, (querySnapshot) => {
        const userTasks: DailyTask[] = [];
        querySnapshot.forEach((doc) => {
          userTasks.push({ id: doc.id, ...doc.data() } as DailyTask);
        });
        setTasks(userTasks);
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
        unsubscribeTasks();
        unsubscribeHistory();
      };
    } else {
      setGoals([]);
      setTasks([]);
      setHistory([]);
      setLoading(false);
    }
  }, [user, loading]);

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
      await addDoc(collection(db, 'users', user.uid, 'goals'), {
        ...data,
        userId: user.uid,
        completedDays: 0,
        createdAt: new Date(),
      });
    }
  };

  const handleUpdateGoal = async (goalId: string, data: { title: string; targetDays: number }) => {
    if (!user) return;
    const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
    await updateDoc(goalRef, data);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    const batch = writeBatch(db);
    const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
    batch.delete(goalRef);
    
    const tasksQuery = query(collection(db, 'users', user.uid, 'dailyTasks'), where('goalId', '==', goalId));
    const tasksSnapshot = await getDocs(tasksQuery);
    tasksSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  };

  const handleAddTask = (data: { title: string; goalId: string }) => {
    if (!user) return;
    addDoc(collection(db, 'users', user.uid, 'dailyTasks'), {
      ...data,
      userId: user.uid,
      completed: false,
      streak: 0,
      completedAt: null,
      createdAt: new Date(),
    });
  };

  const handleUpdateTask = async (task: DailyTask, isCompleted: boolean) => {
    if (!user) return;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const historyDocRef = doc(db, 'users', user.uid, 'dailyTaskHistory', todayStr);
    const taskRef = doc(db, 'users', user.uid, 'dailyTasks', task.id);
    const goalRef = doc(db, 'users', user.uid, 'goals', task.goalId);
    const userRef = doc(db, 'users', user.uid);

    try {
        await runTransaction(db, async (transaction) => {
            const taskDoc = await transaction.get(taskRef);
            const goalDoc = await transaction.get(goalRef);
            if (!taskDoc.exists()) return;

            let newStreak = task.streak || 0;
            if (isCompleted && !task.completed) {
                newStreak++;
            } else if (!isCompleted && task.completed) {
                newStreak = Math.max(0, newStreak - 1);
            }
            transaction.update(taskRef, { 
                completed: isCompleted,
                streak: newStreak,
                completedAt: isCompleted ? new Date() : null 
            });

            if (goalDoc.exists() && isCompleted !== task.completed) {
              transaction.update(goalRef, {
                  completedDays: increment(isCompleted ? 1 : -1)
              });
            }

            if(isCompleted !== task.completed) {
                transaction.set(userRef, { xp: increment(isCompleted ? 5 : -5) }, { merge: true });
            }

            const allTasksQuery = query(collection(db, 'users', user.uid, 'dailyTasks'));
            const allTasksSnapshot = await getDocs(allTasksQuery);
            const totalTasks = allTasksSnapshot.size;
            const completedTasks = allTasksSnapshot.docs.filter(doc => {
              if (doc.id === task.id) return isCompleted;
              return doc.data().completed;
            }).length;

            transaction.set(historyDocRef, {
                date: Timestamp.fromDate(new Date()),
                completed: completedTasks,
                total: totalTasks,
            }, { merge: true });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;

    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    const batch = writeBatch(db);

    if (taskToDelete.completed) {
        const goalRef = doc(db, 'users', user.uid, 'goals', taskToDelete.goalId);
        batch.update(goalRef, { completedDays: increment(-1) });
    }
    const taskRef = doc(db, 'users', user.uid, 'dailyTasks', taskId);
    batch.delete(taskRef);

    await batch.commit();

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const historyDocRef = doc(db, 'users', user.uid, 'dailyTaskHistory', todayStr);
    const remainingTasks = tasks.filter(t => t.id !== taskId);
    
    await updateDoc(historyDocRef, {
        total: remainingTasks.length,
        completed: remainingTasks.filter(t => t.completed).length
    });
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <MyGoalsList
            goals={goalsWithProgress}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
          />
        </div>
        <div className="lg:col-span-2">
          <DailyTaskList
              tasks={tasks}
              goals={goalsWithProgress}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <WeeklyProgressChart data={chartData.weeklyProgress} />
        <ConsistencyTrendChart data={chartData.consistencyTrend} />
      </div>
    </div>
  );
}
