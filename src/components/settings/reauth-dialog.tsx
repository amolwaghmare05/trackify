
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useAuth } from '@/context/auth-context';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const reauthSchema = z.object({
  password: z.string().min(1, { message: 'Password is required.' }),
});

type ReauthFormValues = z.infer<typeof reauthSchema>;

interface ReauthDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
}

export function ReauthDialog({ isOpen, onOpenChange, onSuccess }: ReauthDialogProps) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ReauthFormValues>({
    resolver: zodResolver(reauthSchema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = async (data: ReauthFormValues) => {
    setError(null);
    if (!user || !user.email) {
      setError('Could not re-authenticate. User not found.');
      return;
    }

    try {
      const auth = getAuth();
      const credential = EmailAuthProvider.credential(user.email, data.password);
      if(auth.currentUser) {
        await reauthenticateWithCredential(auth.currentUser, credential);
        handleOpenChange(false); // Close dialog on success
        onSuccess();
      }
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('The password you entered is incorrect. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
        console.error('Re-authentication error:', error);
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Confirm Your Identity</DialogTitle>
          <DialogDescription>
            This is a sensitive action. Please enter your password to continue.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Confirming...' : 'Confirm'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
