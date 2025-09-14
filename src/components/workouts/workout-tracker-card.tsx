
'use client';

import { useState } from 'react';
import type { Workout } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Dumbbell, Flame, Trash2 } from 'lucide-react';
import { AddWorkoutDialog } from './add-workout-dialog';
import { cn } from '@/lib/utils';

interface WorkoutTrackerCardProps {
  workouts: Workout[];
  onAddWorkout: (title: string) => void;
  onUpdateWorkout: (workout: Workout, isCompleted: boolean) => void;
  onDeleteWorkout: (workoutId: string) => void;
}

export function WorkoutTrackerCard({ workouts, onAddWorkout, onUpdateWorkout, onDeleteWorkout }: WorkoutTrackerCardProps) {
  const [isAddWorkoutDialogOpen, setIsAddWorkoutDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-start gap-3">
            <Dumbbell className="h-6 w-6 mt-1 text-primary" />
            <div>
              <CardTitle className="font-headline">Workout Tracker</CardTitle>
              <CardDescription>Your daily workout checklist. Stay disciplined!</CardDescription>
            </div>
          </div>
          <Button onClick={() => setIsAddWorkoutDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Workout
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workouts.length > 0 ? (
              workouts.map((workout) => (
                <div key={workout.id} className="group flex items-center gap-4 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={`workout-${workout.id}`}
                    checked={workout.completed}
                    onCheckedChange={(checked) => onUpdateWorkout(workout, !!checked)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`workout-${workout.id}`}
                      className={cn(
                        "font-medium leading-none cursor-pointer",
                        workout.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {workout.title}
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    {workout.streak > 0 && (
                      <div className="flex items-center gap-1 text-sm text-orange-500 font-medium">
                        <Flame className="h-4 w-4" />
                        {workout.streak}
                      </div>
                    )}
                    {workout.completed && <Badge variant="outline">Done</Badge>}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDeleteWorkout(workout.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    No workouts added yet. Add a workout to get started!
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      <AddWorkoutDialog
        isOpen={isAddWorkoutDialogOpen}
        onOpenChange={setIsAddWorkoutDialogOpen}
        onAddWorkout={onAddWorkout}
      />
    </>
  );
}
