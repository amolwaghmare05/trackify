
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Goal } from '@/lib/types';
import { CheckSquare } from 'lucide-react';

const addTaskSchema = z.object({
  title: z.string().min(1, { message: "Task title is required." }),
  goalId: z.string({ required_error: "Please select a goal." }),
});

type AddTaskFormValues = z.infer<typeof addTaskSchema>;

interface AddTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  goals: Goal[];
}

export function AddTaskDialog({ isOpen, onOpenChange, goals }: AddTaskDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const form = useForm<AddTaskFormValues>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: { title: '', goalId: undefined },
  });

  React.useEffect(() => {
    if (!isOpen) {
      form.reset({ title: '', goalId: undefined });
    }
  }, [isOpen, form]);

  const onSubmit = async (data: AddTaskFormValues) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'dailyTasks'), {
        userId: user.uid,
        goalId: data.goalId,
        title: data.title,
        completed: false,
        streak: 0,
        lastCompleted: null,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Daily task added!' });
      onOpenChange(false); // This will now correctly close the dialog
    } catch (error) {
      console.error("Error adding task: ", error);
      toast({ title: 'Failed to add task.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <CheckSquare className="mr-2 h-5 w-5" />
            Add New Daily Task
          </DialogTitle>
          <DialogDescription>
            Enter the details for your new goal-related task.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Practice guitar scales for 15 minutes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Associated Goal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Link to a goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {goals.map(goal => (
                              <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Adding...' : 'Add Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
