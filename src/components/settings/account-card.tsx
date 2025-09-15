
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { getAuth, deleteUser } from 'firebase/auth';
import { doc, writeBatch, getDocs, query, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ReauthDialog } from './reauth-dialog';

export function AccountCard() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReauthDialogOpen, setIsReauthDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const performDelete = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      const collectionsToDelete = ['goals', 'completedGoals', 'dailyTasks', 'dailyTaskHistory', 'todayTasks', 'workouts', 'workoutHistory'];
      const batch = writeBatch(db);

      for (const collectionName of collectionsToDelete) {
        const q = query(collection(db, 'users', user.uid, collectionName));
        const snapshot = await getDocs(q);
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      }
      
      const userDocRef = doc(db, 'users', user.uid);
      batch.delete(userDocRef);
      await batch.commit();

      const auth = getAuth();
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }

      toast({
        title: 'Account Deleted',
        description: 'Your account and all data have been successfully deleted.',
      });

      router.push('/sign-up');

    } catch (error: any) {
      setIsDeleting(false);
      setIsConfirmDialogOpen(false);
      console.error('Error deleting account:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        setIsReauthDialogOpen(true);
      } else {
         toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not delete your account. Please try again.',
        });
      }
    }
  };

  const handleReauthSuccess = () => {
    setIsReauthDialogOpen(false);
    setIsConfirmDialogOpen(true); 
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account data and permanent actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-center justify-between">
                  <div>
                      <h3 className="font-semibold text-destructive">Delete Account</h3>
                      <p className="text-sm text-destructive/80">Permanently remove your account and all of its content.</p>
                  </div>
                  <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" disabled={isDeleting}>Delete Account</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This action is irreversible and will permanently delete your account and all associated data, including goals, tasks, workouts, and history.
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={performDelete} disabled={isDeleting} variant="destructive">
                              {isDeleting ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              </div>
          </div>
        </CardContent>
      </Card>
      
      <ReauthDialog
        isOpen={isReauthDialogOpen}
        onOpenChange={setIsReauthDialogOpen}
        onSuccess={handleReauthSuccess}
      />
    </>
  );
}
