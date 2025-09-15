
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChartHorizontal, Gem, Trophy, CheckSquare, Info } from 'lucide-react';
import { StatCard } from './stat-card';
import { type UserLevel } from '@/lib/levels';
import { XpProgressBar } from './xp-progress-bar';
import { Button } from '../ui/button';
import { LevelXpDialog } from './level-xp-dialog';
import { XpEarningInfoDialog } from './xp-earning-info-dialog';

interface StatisticsCardProps {
  xp: number;
  level: UserLevel;
  goalsCompleted: number;
  dailyTasksDone: number;
  workoutsDone: number;
}

export function StatisticsCard({ xp, level, goalsCompleted, dailyTasksDone, workoutsDone }: StatisticsCardProps) {
  const [isLevelInfoOpen, setIsLevelInfoOpen] = useState(false);
  const [isXpInfoOpen, setIsXpInfoOpen] = useState(false);

  return (
    <>
      <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                  <BarChartHorizontal className="h-6 w-6 text-foreground" />
                  <div>
                      <CardTitle className="font-headline">Your Statistics</CardTitle>
                      <CardDescription>A summary of your achievements.</CardDescription>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsXpInfoOpen(true)}>
                  <Info className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsLevelInfoOpen(true)}>
                  <Info className="h-5 w-5" />
                </Button>
              </div>
          </CardHeader>
          <CardContent className="space-y-6">
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-4">
                    <Gem className="h-8 w-8 text-primary" />
                    <div>
                        <p className="text-2xl font-bold font-headline">{xp.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Current XP</p>
                    </div>
                </div>
                <XpProgressBar
                  currentXp={xp}
                  level={level.level}
                  levelName={level.name}
                  xpForNextLevel={level.xpForNextLevel}
                  xpForCurrentLevel={level.xpForCurrentLevel}
                />
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard icon={Trophy} value={goalsCompleted} label="Goals Completed" />
                  <StatCard icon={CheckSquare} value={dailyTasksDone} label="Daily Tasks Done" />
                  <StatCard icon={CheckSquare} value={workoutsDone} label="Workouts Done" />
              </div>
          </CardContent>
      </Card>
      <LevelXpDialog isOpen={isLevelInfoOpen} onOpenChange={setIsLevelInfoOpen} />
      <XpEarningInfoDialog isOpen={isXpInfoOpen} onOpenChange={setIsXpInfoOpen} />
    </>
  );
}
