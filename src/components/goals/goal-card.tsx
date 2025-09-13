'use client';

import { useState } from 'react';
import type { Goal, DailyTask } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreVertical, Edit, Trash2, Flame } from 'lucide-react';
import { AddTaskForm } from './add-task-form';
import { DailyTaskList } from './daily-task-list';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { AddGoalDialog } from './add-goal-dialog';

interface GoalCardProps {
  goal: Goal;
  tasks: DailyTask[];
  onUpdateGoal: (goalId: string, data: { title: string; targetDays: number }) => void;
  onDeleteGoal: (goalId: string) => void;
}

export function GoalCard({ goal, tasks, onUpdateGoal, onDeleteGoal }: GoalCardProps) {
  const [isAddTaskFormVisible, setIsAddTaskFormVisible] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const totalStreak = tasks.reduce((sum, task) => sum + task.streak, 0);

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className='flex-1 pr-4'>
                <CardTitle className="font-headline text-lg">{goal.title}</CardTitle>
                <CardDescription>Target: {goal.targetDays} days</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Goal
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Goal
                    </DropdownMenuItem>
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <span className="text-sm font-bold">{Math.round(goal.progress)}%</span>
            </div>
            <Progress value={goal.progress} />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Daily Tasks</h4>
            <DailyTaskList tasks={tasks} goalId={goal.id} targetDays={goal.targetDays} />
            {isAddTaskFormVisible ? (
              <AddTaskForm goalId={goal.id} onTaskAdded={() => setIsAddTaskFormVisible(false)} />
            ) : (
              <Button variant="outline" size="sm" className="w-full" onClick={() => setIsAddTaskFormVisible(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Daily Task
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-4 rounded-b-lg">
            <div className="flex items-center text-sm font-semibold text-muted-foreground">
                <Flame className="mr-2 h-5 w-5 text-orange-500"/>
                Total Days Completed: {totalStreak}
            </div>
        </CardFooter>
      </Card>
      <AddGoalDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        goal={goal}
        onAddGoal={(data) => onUpdateGoal(goal.id, data)}
      />
    </>
  );
}
