
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getMotivationAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Bot } from 'lucide-react';

interface AIMotivationProps {
  userName: string;
  goal?: string;
  progressPercentage: number;
  consistencyScore: number;
}

export function AIMotivation({ userName, goal, progressPercentage, consistencyScore }: AIMotivationProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const [refreshId, setRefreshId] = useState(0);
  const motivationInput = useMemo(() => ({
    userName,
    goal,
    progressPercentage,
    consistencyScore,
    refreshId,
  }), [userName, goal, progressPercentage, consistencyScore, refreshId]);

  const fetchMotivation = async () => {
    setLoading(true);
    try {
      const result = await getMotivationAction(motivationInput);
      setMessage(result.message);
    } catch (error) {
      console.error('Failed to fetch AI motivation:', error);
      setMessage("Keep pushing forward, you're on the right track!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotivation();
  }, [motivationInput]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-foreground" />
          <CardTitle className="font-headline">AI Coach</CardTitle>
        </div>
        <button
          type="button"
          className="px-2 py-1 rounded-md bg-muted hover:bg-primary/10 text-xs text-muted-foreground border border-muted-foreground/20 transition-colors"
          onClick={() => { setRefreshId(Math.random()); fetchMotivation(); }}
          disabled={loading}
          aria-label="Refresh Motivation"
        >
          Refresh
        </button>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex-1 pt-1">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[60%]" />
              </div>
            ) : (
              <p className="text-sm text-foreground/90 leading-relaxed">
                {message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
