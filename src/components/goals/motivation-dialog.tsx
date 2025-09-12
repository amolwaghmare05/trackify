'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { getMotivationAction } from '@/app/actions';
import type { Goal } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const motivationSchema = z.object({
  feelings: z.string().min(10, { message: 'Please describe your feelings in a bit more detail (at least 10 characters).' }),
});

type MotivationFormValues = z.infer<typeof motivationSchema>;

interface MotivationDialogProps {
  goal: Goal;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function MotivationDialog({ goal, isOpen, onOpenChange }: MotivationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [motivation, setMotivation] = useState<{ message: string; suggestion: string } | null>(null);

  const form = useForm<MotivationFormValues>({
    resolver: zodResolver(motivationSchema),
    defaultValues: { feelings: '' },
  });

  const onSubmit = async (data: MotivationFormValues) => {
    setIsLoading(true);
    setMotivation(null);
    const result = await getMotivationAction({
      goal: goal.title,
      progress: goal.progress,
      feelings: data.feelings,
    });
    setMotivation(result);
    setIsLoading(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setMotivation(null);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
            AI-Powered Motivation
          </DialogTitle>
          <DialogDescription>
            Feeling stuck on your goal "{goal.title}"? Let our AI assistant provide some encouragement.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
        {!motivation ? (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="feelings"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>How are you feeling about this goal right now?</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="e.g., I'm feeling overwhelmed and not sure where to start..."
                        className="resize-none"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get Encouragement
                </Button>
            </form>
            </Form>
        ) : (
            <div className="space-y-4">
                <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>A Message for You</AlertTitle>
                    <AlertDescription>
                       {motivation.message}
                    </AlertDescription>
                </Alert>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm font-semibold mb-2">Here's a suggestion:</p>
                        <p className="text-sm text-muted-foreground">{motivation.suggestion}</p>
                    </CardContent>
                </Card>
                 <Button onClick={() => setMotivation(null)} variant="outline" className="w-full">
                    Ask Again
                </Button>
            </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
