'use client';

import { useState } from 'react';
import type { DailyTask, Goal } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, CheckCircle, Flame, Trash2 } from 'lucide-react';
import { AddTaskDialog } from './add-task-dialog';
import { cn } from '@/lib/utils';
import { serverTimestamp } from 'firebase/firestore';

interface DailyTaskListProps {
  tasks: DailyTask[];
  goals: Goal[];
  onAddTask: (data: { title: string; goalId: string }) => Promise<void>;
  onUpdateTask: (taskId: string, data: Partial<DailyTask>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function DailyTaskList({ tasks, goals, onAddTask, onUpdateTask, onDeleteTask }: DailyTaskListProps) {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);

  const getGoalTitle = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.title : 'Unassigned';
  };
  
  const handleToggleTask = (task: DailyTask) => {
    const isCompleted = !task.completed;
    let newStreak = task.streak;

    if (isCompleted) {
        // Basic streak logic: increment if completed today.
        // A more robust implementation would check the last completed date.
        newStreak = (task.streak || 0) + 1;
    } else {
        // If unchecking, you might want to reset or decrement streak
        // For simplicity, we'll just decrement, but not below 0
        newStreak = Math.max(0, (task.streak || 0) - 1);
    }

    onUpdateTask(task.id, { 
        completed: isCompleted,
        streak: newStreak,
        completedAt: isCompleted ? new Date() : null 
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6" />
            <h2 className="text-xl font-bold font-headline">Daily Tasks</h2>
          </div>
          <Button onClick={() => setIsAddTaskDialogOpen(true)} disabled={goals.length === 0}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.length === 0 ? (
                 <div className="text-center text-muted-foreground py-8">
                    No tasks yet. Add a goal first, then add tasks.
                </div>
            ) : tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="group flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={cn(
                        "font-medium leading-none cursor-pointer",
                        task.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {getGoalTitle(task.goalId)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {task.streak > 0 && (
                      <div className="flex items-center gap-1 text-sm text-orange-500 font-medium">
                        <Flame className="h-4 w-4" />
                        {task.streak}
                      </div>
                    )}
                    {task.completed && <Badge variant="outline">Done</Badge>}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    No tasks yet. Click "Add Task" to get started!
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onAddTask={onAddTask}
        goals={goals}
      />
    </>
  );
}
