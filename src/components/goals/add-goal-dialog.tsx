
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Target } from 'lucide-react';

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
import type { Goal } from '@/lib/types';

const addGoalSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  targetDays: z.coerce.number().min(1, { message: 'Target days must be at least 1.' }),
});

type AddGoalFormValues = z.infer<typeof addGoalSchema>;

interface AddGoalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddGoal: (data: AddGoalFormValues) => void;
  goal?: Goal; // Optional for editing
}

export function AddGoalDialog({ isOpen, onOpenChange, onAddGoal, goal }: AddGoalDialogProps) {
  const form = useForm<AddGoalFormValues>({
    resolver: zodResolver(addGoalSchema),
    defaultValues: {
      title: goal?.title || '',
      targetDays: goal?.targetDays || 30,
    },
  });

  // useEffect to reset form when goal prop changes (for editing)
  React.useEffect(() => {
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
  }, [goal, form, isOpen]);


  const onSubmit = (data: AddGoalFormValues) => {
    onAddGoal(data);
    onOpenChange(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset({ title: '', targetDays: 30 });
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <Target className="mr-2 h-5 w-5" />
            {goal ? 'Edit Goal' : 'Add New Goal'}
          </DialogTitle>
          <DialogDescription>
            {goal ? 'Update the details of your long-term goal.' : 'Enter the details for your new goal.'}
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
                <Button type="submit">{goal ? 'Save Changes' : 'Add Goal'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
