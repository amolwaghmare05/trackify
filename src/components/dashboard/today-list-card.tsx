
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  runTransaction,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { TodayTask } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2, Star, ClipboardList } from 'lucide-react';
import { AddTodayTaskDialog } from './add-today-task-dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function TodayListCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TodayTask[]>([]);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const startOfToday = Timestamp.fromDate(today);
      const startOfTomorrow = Timestamp.fromDate(tomorrow);

      const tasksQuery = query(
        collection(db, 'users', user.uid, 'todayTasks'),
        where('createdAt', '>=', startOfToday),
        where('createdAt', '<', startOfTomorrow),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(tasksQuery, (querySnapshot) => {
        const userTasks: TodayTask[] = [];
        querySnapshot.forEach((doc) => {
          userTasks.push({ id: doc.id, ...doc.data() } as TodayTask);
        });
        setTasks(userTasks);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  const sortedTasks = useMemo(() => {
    return tasks.slice().sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return 0;
    });
  }, [tasks]);

  const handleAddTask = async (title: string) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'todayTasks'), {
      title,
      userId: user.uid,
      completed: false,
      isPrimary: false,
      createdAt: new Date(),
    });
  };

  const handleUpdateCompletion = async (task: TodayTask, completed: boolean) => {
    if (!user) return;
    const taskRef = doc(db, 'users', user.uid, 'todayTasks', task.id);
    const userRef = doc(db, 'users', user.uid);

    try {
        await runTransaction(db, async (transaction) => {
            if(task.completed !== completed){
                transaction.update(taskRef, { completed });
                transaction.set(userRef, { xp: increment(completed ? 2 : -2) }, { merge: true });
            }
        });
        if (completed && !task.completed) {
            toast({
                title: '+2 XP!',
                description: 'You earned XP for completing a daily task.',
            });
        }
    } catch (e) {
        console.error("Failed to update task completion: ", e);
    }
  };

  const handleUpdatePrimary = async (taskId: string, isPrimary: boolean) => {
    if (!user) return;
    const taskRef = doc(db, 'users', user.uid, 'todayTasks', taskId);
    await updateDoc(taskRef, { isPrimary });
  };


  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'todayTasks', taskId));
  };

  return (
    <>
      <Card>
        <CardHeader>
            <div className="flex items-start gap-3">
                <ClipboardList className="h-6 w-6 mt-1 text-primary" />
                <div>
                <CardTitle className="font-headline">Today's List</CardTitle>
                <CardDescription>Your daily to-do list for miscellaneous tasks.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading tasks...</div>
            ) : tasks.length > 0 ? (
              sortedTasks.map((task) => (
                <div key={task.id} className="group flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={(checked) => handleUpdateCompletion(task, !!checked)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={cn(
                        'font-medium leading-none cursor-pointer',
                        task.completed && 'line-through text-muted-foreground'
                      )}
                    >
                      {task.title}
                    </label>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-amber-500"
                        onClick={() => handleUpdatePrimary(task.id, !task.isPrimary)}
                    >
                        <Star className={cn("h-4 w-4", task.isPrimary && "fill-amber-400 text-amber-500")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No tasks for today. Add a task to get started!
              </div>
            )}
          </div>
        </CardContent>
        <CardHeader>
             <Button onClick={() => setIsAddTaskDialogOpen(true)} variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Task
             </Button>
        </CardHeader>
      </Card>
      <AddTodayTaskDialog
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onAddTask={handleAddTask}
      />
    </>
  );
}
