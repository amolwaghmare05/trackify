'use client';

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
import { useToast } from '@/hooks/use-toast';
import type { Goal } from '@/lib/types';
import { Card, CardContent } from '../ui/card';

const addTaskSchema = z.object({
  title: z.string().min(3, { message: 'Task title must be at least 3 characters.' }),
  goalId: z.string({ required_error: "Please select a goal." }),
});

type AddTaskFormValues = z.infer<typeof addTaskSchema>;

interface AddTaskSectionProps {
  goals: Goal[];
}

export function AddTaskSection({ goals }: AddTaskSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const form = useForm<AddTaskFormValues>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: { title: '' },
  });

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
      form.reset();
    } catch (error) {
      console.error("Error adding task: ", error);
      toast({ title: 'Failed to add task.', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>New Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Code for 30 minutes" {...field} />
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
                  <FormLabel>Link to Goal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a goal" />
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
            <Button type="submit" className="w-full md:col-span-3">Add New Daily Task</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
