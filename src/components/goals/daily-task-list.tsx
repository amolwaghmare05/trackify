'use client';

import { collection, doc, updateDoc, increment, serverTimestamp, writeBatch, getDocs, query, where, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DailyTask } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Trash2, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isSameDay } from 'date-fns';

interface DailyTaskListProps {
  tasks: DailyTask[];
  goalId: string;
  targetDays: number;
}

export function DailyTaskList({ tasks, goalId, targetDays }: DailyTaskListProps) {
  const { toast } = useToast();

  const handleTaskCheck = async (task: DailyTask) => {
    const taskRef = doc(db, 'dailyTasks', task.id);
    const goalRef = doc(db, 'goals', goalId);
    const newCompletedState = !task.completed;

    try {
        const today = new Date();
        let newStreak = task.streak;
        let newLastCompleted = task.lastCompleted;

        // Logic for streak and progress
        if (newCompletedState) { // If checking the box
            const lastCompletedDate = task.lastCompleted?.toDate();
            // Only increment streak if it wasn't already completed today
            if (!lastCompletedDate || !isSameDay(lastCompletedDate, today)) {
                newStreak = task.streak + 1;
                newLastCompleted = Timestamp.fromDate(today);
            }
        } else { // If unchecking the box
            const lastCompletedDate = task.lastCompleted?.toDate();
            // Only decrement streak if it was completed today
            if (lastCompletedDate && isSameDay(lastCompletedDate, today)) {
                newStreak = Math.max(0, task.streak - 1); // Ensure streak doesn't go below 0
                // This logic is simple; a more complex app might need to find the previous completion date.
                // For now, we set to null, meaning they'd have to complete it again tomorrow to continue the streak.
                newLastCompleted = null;
            }
        }
        
        await updateDoc(taskRef, {
            completed: newCompletedState,
            streak: newStreak,
            lastCompleted: newLastCompleted,
        });

        // Recalculate goal progress
        const tasksQuery = query(collection(db, 'dailyTasks'), where('goalId', '==', goalId));
        const tasksSnapshot = await getDocs(tasksQuery);
        const allGoalTasks = tasksSnapshot.docs.map(d => d.data() as DailyTask);

        const totalStreak = allGoalTasks.reduce((acc, currentTask) => {
            // After our update, the task we modified is stale in the `allGoalTasks` array.
            // So, we find it and use its new streak value.
            if (currentTask.id === task.id) {
                return acc + newStreak;
            }
            return acc + currentTask.streak;
        }, 0);
        
        const newProgress = Math.min(100, (totalStreak / targetDays) * 100);

        await updateDoc(goalRef, {
            progress: newProgress,
        });

    } catch (error) {
        console.error("Error updating task: ", error);
        toast({ title: 'Failed to update task.', variant: 'destructive' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
        await deleteDoc(doc(db, 'dailyTasks', taskId));
        // You might want to recalculate progress here as well
        toast({ title: "Task deleted." });
    } catch (error) {
        console.error("Error deleting task: ", error);
        toast({ title: 'Failed to delete task.', variant: 'destructive' });
    }
  };

  if (tasks.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-2">No daily tasks yet. Add one to get started!</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map(task => (
        <li key={task.id} className="flex items-center justify-between p-2 rounded-md bg-background hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => handleTaskCheck(task)}
            />
            <label htmlFor={`task-${task.id}`} className="text-sm cursor-pointer">{task.title}</label>
          </div>
          <div className="flex items-center gap-2">
            <div className='flex items-center text-xs text-orange-500 font-semibold'>
                <Flame className="h-3 w-3 mr-1" />
                {task.streak}
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteTask(task.id)}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
