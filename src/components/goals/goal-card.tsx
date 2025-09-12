'use client';

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Calendar, CheckCircle2, MoreVertical, Trash2, Edit, Sparkles, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Goal } from '@/lib/types';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { MotivationDialog } from './motivation-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

interface GoalCardProps {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const { toast } = useToast();
  const [isMotivationOpen, setIsMotivationOpen] = useState(false);

  const handleProgressChange = (value: number[]) => {
    onUpdate({ ...goal, progress: value[0] });
  };

  const handleCompleteToggle = () => {
    const isCompleting = !goal.isCompleted;
    onUpdate({ 
        ...goal, 
        isCompleted: isCompleting, 
        progress: isCompleting ? 100 : goal.progress,
        completedAt: isCompleting ? new Date() : undefined,
    });
    toast({
        title: isCompleting ? "Goal Completed!" : "Goal Reactivated",
        description: `"${goal.title}" marked as ${isCompleting ? 'complete' : 'active'}.`,
    })
  };

  const timeToTarget = formatDistanceToNow(goal.targetDate, { addSuffix: true });
  const isOverdue = !goal.isCompleted && new Date() > goal.targetDate;

  return (
    <>
      <Card className={cn(
        "flex flex-col transition-all duration-300 hover:shadow-lg", 
        goal.isCompleted && "bg-card/60"
        )}>
        <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
                <CardTitle className="font-headline text-lg pr-2">{goal.title}</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -mt-2 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Goal Options</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsMotivationOpen(true)}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Get Motivation
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Goal
                          </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your goal.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(goal.id)} className={cn("bg-destructive text-destructive-foreground hover:bg-destructive/90")}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          <CardDescription className={cn("flex items-center text-xs pt-1", isOverdue && "text-destructive font-semibold")}>
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            {isOverdue ? `Overdue` : `Target: ${format(goal.targetDate, 'MMM d, yyyy')}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          {goal.description && <p className="text-muted-foreground text-sm">{goal.description}</p>}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-muted-foreground">Progress</span>
              <Badge variant={goal.progress === 100 ? 'default' : 'secondary'}>{goal.progress}%</Badge>
            </div>
            <Progress value={goal.progress} />
            {!goal.isCompleted && (
              <Slider
                value={[goal.progress]}
                onValueChange={handleProgressChange}
                max={100}
                step={5}
                className="pt-2"
              />
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant={goal.isCompleted ? "outline" : "default"} className="w-full" onClick={handleCompleteToggle}>
            {goal.isCompleted ? <XCircle className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            {goal.isCompleted ? "Mark Incomplete" : "Mark Complete"}
          </Button>
        </CardFooter>
      </Card>
      <MotivationDialog goal={goal} isOpen={isMotivationOpen} onOpenChange={setIsMotivationOpen} />
    </>
  );
}
