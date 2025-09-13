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
import { useToast } from '@/hooks/use-toast';

const addTaskSchema = z.object({
  title: z.string().min(3, { message: 'Task title must be at least 3 characters.' }),
});

type AddTaskFormValues = z.infer<typeof addTaskSchema>;

interface AddTaskFormProps {
  goalId: string;
  onTaskAdded: () => void;
}

export function AddTaskForm({ goalId, onTaskAdded }: AddTaskFormProps) {
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
        goalId: goalId,
        title: data.title,
        completed: false,
        streak: 0,
        lastCompleted: null,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Daily task added!' });
      form.reset();
      onTaskAdded();
    } catch (error) {
      console.error("Error adding task: ", error);
      toast({ title: 'Failed to add task.', variant: 'destructive' });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input placeholder="e.g., Code for 30 minutes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm">Add</Button>
      </form>
    </Form>
  );
}
