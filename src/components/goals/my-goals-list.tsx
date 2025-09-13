
'use client';

import * as React from 'react';
import type { Goal, DailyTask } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { AddGoalDialog } from './add-goal-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

interface MyGoalsListProps {
  goals: Goal[];
  tasks: DailyTask[];
  onAddGoal: () => void;
  onUpdateGoal: (goalId: string, data: { title: string; targetDays: number }) => void;
  onDeleteGoal: (goalId: string) => void;
}

export function MyGoalsList({ goals, tasks, onAddGoal, onUpdateGoal, onDeleteGoal }: MyGoalsListProps) {
  const [editingGoal, setEditingGoal] = React.useState<Goal | undefined>(undefined);

  const handleEditClick = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const handleUpdate = (data: { title: string; targetDays: number }) => {
    if (editingGoal) {
      onUpdateGoal(editingGoal.id, data);
    }
  };
  
  const totalStreaksByGoal = React.useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.goalId]) {
        acc[task.goalId] = 0;
      }
      acc[task.goalId] += task.streak;
      return acc;
    }, {} as { [key: string]: number });
  }, [tasks]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            <CardTitle className="font-headline text-2xl">Your Goals</CardTitle>
          </div>
          <Button onClick={onAddGoal} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="group flex flex-col gap-2 rounded-md p-2 hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{goal.title}</span>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-sm font-bold">{Math.round(goal.progress)}%</span>
                        <p className="text-xs text-muted-foreground">{totalStreaksByGoal[goal.id] || 0}/{goal.targetDays} days</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditClick(goal)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the goal and all its associated daily tasks. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteGoal(goal.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <AddGoalDialog
        isOpen={!!editingGoal}
        onOpenChange={(isOpen) => !isOpen && setEditingGoal(undefined)}
        goal={editingGoal}
        onAddGoal={handleUpdate}
      />
    </>
  );
}
