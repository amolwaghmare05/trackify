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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { TodayTask } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Star, ClipboardList } from 'lucide-react';
import { AddTodayTaskDialog } from './add-today-task-dialog';
import { cn } from '@/lib/utils';

export function TodayListCard() {
  const { user } = useAuth();
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
        collection(db, 'todayTasks'),
        where('userId', '==', user.uid),
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
      return 0; // Keep original order for tasks with same primary status
    });
  }, [tasks]);

  const handleAddTask = async (title: string) => {
    if (!user) return;
    await addDoc(collection(db, 'todayTasks'), {
      title,
      userId: user.uid,
      completed: false,
      isPrimary: false,
      createdAt: new Date(),
    });
  };

  const handleUpdateTask = async (taskId: string, data: Partial<TodayTask>) => {
    const taskRef = doc(db, 'todayTasks', taskId);
    await updateDoc(taskRef, data);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, 'todayTasks', taskId));
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-start gap-3">
            <ClipboardList className="h-6 w-6 mt-1 text-primary" />
            <div>
              <CardTitle className="font-headline">Today's List</CardTitle>
              <CardDescription>Your daily to-do list for miscellaneous tasks.</CardDescription>
            </div>
          </div>
          <Button onClick={() => setIsAddTaskDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Task
          </Button>
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
                    onCheckedChange={(checked) => handleUpdateTask(task.id, { completed: !!checked })}
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
                  <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-amber-500"
                        onClick={() => handleUpdateTask(task.id, { isPrimary: !task.isPrimary })}
                    >
                        <Star className={cn("h-4 w-4", task.isPrimary && "fill-amber-400 text-amber-500")} />
                    </Button>
                    {task.completed && <Badge variant="outline">Done</Badge>}
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
      </Card>
      <AddTodayTaskDialog
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onAddTask={handleAddTask}
      />
    </>
  );
}
