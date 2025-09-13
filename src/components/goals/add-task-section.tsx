
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
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
      form.setValue('goalId', ''); // Reset select
    } catch (error) {
      console.error("Error adding task: ", error);
      toast({ title: 'Failed to add task.', variant: 'destructive' });
    }
  };

  return (
    <Card className="bg-muted/50 border-dashed">
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormControl>
                    <Input placeholder="Add a new task..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goalId"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
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
            <Button type="submit" className="w-full sm:col-span-1">Add Task</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
