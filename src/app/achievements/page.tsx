
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { CompletedGoal } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trophy } from 'lucide-react';
import { format } from 'date-fns';

function AchievementItem({ goal }: { goal: CompletedGoal }) {
    const completionDate = goal.completedAt 
        ? (goal.completedAt as any).seconds 
            ? new Date((goal.completedAt as any).seconds * 1000) 
            : new Date(goal.completedAt as any)
        : new Date();

    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                        <p className="font-semibold">{goal.title}</p>
                        <p className="text-sm text-muted-foreground">
                            Completed on {format(completionDate, 'MMMM d, yyyy')}
                        </p>
                    </div>
                </div>
                <Badge variant="outline">Completed</Badge>
            </CardContent>
        </Card>
    );
}


export default function AchievementsPage() {
  const { user, loading } = useAuth();
  const [completedGoals, setCompletedGoals] = useState<CompletedGoal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'users', user.uid, 'completedGoals'), 
        orderBy('completedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const goals: CompletedGoal[] = [];
        querySnapshot.forEach((doc) => {
          goals.push({ id: doc.id, ...doc.data() } as CompletedGoal);
        });
        setCompletedGoals(goals);
        setDataLoading(false);
      });

      return () => unsubscribe();
    } else if (!loading) {
      setDataLoading(false);
    }
  }, [user, loading]);
  
  if (loading || dataLoading) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
            <p>Loading achievements...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
       <div className="mb-8 flex items-center gap-3">
        <Trophy className="h-8 w-8 text-foreground" />
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Achievements</h1>
            <p className="text-muted-foreground">Your completed goals will be displayed here.</p>
        </div>
      </div>

      <div className="space-y-4">
        {completedGoals.length > 0 ? (
          completedGoals.map((goal) => (
            <AchievementItem key={goal.id} goal={goal} />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <p>You haven't completed any goals yet. Keep going!</p>
          </div>
        )}
      </div>
    </div>
  );
}
