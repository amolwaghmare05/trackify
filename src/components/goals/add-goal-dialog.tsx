'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Goal } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const goalSchema = z.object({
  title: z.string().min(1, { message: 'Goal title is required.' }),
  targetDays: z.coerce.number().min(1, { message: 'Target days must be at least 1.' }),
});

type GoalFormValues = z.infer<typeof goalSchema>;

interface AddGoalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddGoal: (data: GoalFormValues) => void;
  goal?: Goal;
}

export function AddGoalDialog({ isOpen, onOpenChange, onAddGoal, goal }: AddGoalDialogProps) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      targetDays: 30,
    },
  });
  
  useEffect(() => {
    if (goal) {
      form.reset({
        title: goal.title,
        targetDays: goal.targetDays,
      });
    } else {
        form.reset({
            title: '',
            targetDays: 30,
        });
    }
  }, [goal, form]);

  const onSubmit = async (data: GoalFormValues) => {
    onAddGoal(data);
    onOpenChange(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{goal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
          <DialogDescription>
            {goal ? 'Update the details for your goal.' : 'Enter the details for your new goal.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Learn to Play Piano" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Days</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 90" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : (goal ? 'Save Changes' : 'Add Goal')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
