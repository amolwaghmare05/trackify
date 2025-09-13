
'use client';

import React from 'react';
import { collection, doc, updateDoc, getDocs, query, where, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DailyTask, Goal } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Trash2, Flame, PlusCircle, CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AddTaskDialog } from './add-task-dialog';
import { cn } from '@/lib/utils';

interface DailyTaskListProps {
  tasks: DailyTask[];
  goals: Goal[];
}

export function DailyTaskList({ tasks, goals }: DailyTaskListProps) {
  const { toast } = useToast();
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = React.useState(false);
  const goalsMap = React.useMemo(() => new Map(goals.map(g => [g.id, g])), [goals]);

  const handleTaskCheck = async (task: DailyTask) => {
    const taskRef = doc(db, 'dailyTasks', task.id);
    const goalRef = doc(db, 'goals', task.goalId);
    const goal = goalsMap.get(task.goalId);
    if (!goal) return;

    const newCompletedState = !task.completed;

    try {
        const today = new Date();
        let newStreak = task.streak;
        let newLastCompleted = task.lastCompleted;

        if (newCompletedState) { 
            const lastCompletedDate = task.lastCompleted?.toDate();
            if (!lastCompletedDate || !isSameDay(lastCompletedDate, today)) {
                newStreak = task.streak + 1;
                newLastCompleted = Timestamp.fromDate(today);
            }
        } else {
            const lastCompletedDate = task.lastCompleted?.toDate();
            if (lastCompletedDate && isSameDay(lastCompletedDate, today)) {
                newStreak = Math.max(0, task.streak - 1); 
                newLastCompleted = null;
            }
        }
        
        await updateDoc(taskRef, {
            completed: newCompletedState,
            streak: newStreak,
            lastCompleted: newLastCompleted,
        });

        // Recalculate goal progress
        const tasksQuery = query(collection(db, 'dailyTasks'), where('goalId', '==', task.goalId));
        const tasksSnapshot = await getDocs(tasksQuery);
        const allGoalTasks = tasksSnapshot.docs.map(d => d.data() as DailyTask);

        const totalStreak = allGoalTasks.reduce((acc, currentTask) => {
            const updatedTask = tasks.find(t => t.id === currentTask.id);
            if (updatedTask && updatedTask.id === task.id) {
                return acc + newStreak;
            }
            return acc + (updatedTask?.streak || 0);
        }, 0);
        
        const newProgress = Math.min(100, (totalStreak / goal.targetDays) * 100);

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
        toast({ title: "Task deleted." });
    } catch (error) {
        console.error("Error deleting task: ", error);
        toast({ title: 'Failed to delete task.', variant: 'destructive' });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className='flex items-center gap-2'>
                <CheckSquare className="h-6 w-6" />
                <CardTitle className="font-headline text-2xl">Daily Tasks</CardTitle>
            </div>
            <Button onClick={() => setIsAddTaskDialogOpen(true)} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Task
            </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.length > 0 ? (
            <ul className="space-y-2">
              {tasks.map(task => (
                <li key={task.id} className="group flex items-center justify-between p-2 rounded-md bg-background hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => handleTaskCheck(task)}
                      className="h-5 w-5"
                    />
                    <div>
                      <label 
                        htmlFor={`task-${task.id}`} 
                        className={cn(
                          "text-sm font-medium cursor-pointer",
                          task.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {task.title}
                      </label>
                      <p className="text-xs text-muted-foreground">{goalsMap.get(task.goalId)?.title || 'Unlinked'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {task.streak > 0 && (
                      <div className='flex items-center text-sm text-orange-500 font-semibold'>
                          <Flame className="h-4 w-4 mr-1" />
                          {task.streak}
                      </div>
                    )}
                    {task.completed && <Badge variant="outline">Done</Badge>}
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
              <div className="mt-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center h-auto">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold tracking-tight font-headline">No tasks yet.</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                      Add a goal first, then add tasks.
                  </p>
              </div>
          )}
        </CardContent>
      </Card>
      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        goals={goals}
      />
    </>
  );
}
