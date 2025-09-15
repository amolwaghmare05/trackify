
'use client';

import { useState } from 'react';
import type { Goal } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Target, Pencil, Trash2 } from 'lucide-react';
import { AddGoalDialog } from './add-goal-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

interface MyGoalsListProps {
  goals: Goal[];
  onAddGoal: (data: { title: string; targetDays: number }) => void;
  onUpdateGoal: (goalId: string, data: { title: string; targetDays: number }) => void;
  onDeleteGoal: (goalId: string) => void;
}

export function MyGoalsList({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }: MyGoalsListProps) {
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const handleAddOrUpdateGoal = (data: { title: string; targetDays: number }) => {
    if (editingGoal) {
      onUpdateGoal(editingGoal.id, data);
    } else {
      onAddGoal(data);
    }
    setEditingGoal(undefined);
    setIsAddGoalDialogOpen(false);
  };

  const handleOpenEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setIsAddGoalDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setEditingGoal(undefined);
    setIsAddGoalDialogOpen(true);
  }

  const handleDeleteConfirm = () => {
    if (goalToDelete) {
      onDeleteGoal(goalToDelete.id);
      setGoalToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            <h2 className="text-xl font-bold font-headline">Your Goals</h2>
          </div>
          <Button onClick={handleOpenAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {goals.length > 0 ? (
              goals.map((goal) => (
                <div key={goal.id} className="group">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{goal.title}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold">{Math.round(goal.progress || 0)}%</p>
                        <p className="text-xs text-muted-foreground">{goal.completedDays || 0}/{goal.targetDays} days</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(goal)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setGoalToDelete(goal)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Progress value={goal.progress || 0} className="mt-2 h-2" />
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No goals yet. Click "Add Goal" to get started!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AddGoalDialog
        isOpen={isAddGoalDialogOpen}
        onOpenChange={setIsAddGoalDialogOpen}
        onAddGoal={handleAddOrUpdateGoal}
        goal={editingGoal}
      />

      <AlertDialog open={!!goalToDelete} onOpenChange={() => setGoalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your goal and all of its associated daily tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setGoalToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} variant="destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
