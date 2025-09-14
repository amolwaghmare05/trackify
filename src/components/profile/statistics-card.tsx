'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChartHorizontal, Gem, Trophy, CheckCircle, Dumbbell } from 'lucide-react';

interface StatisticsCardProps {
  xp: number;
  goalsCompleted: number;
  dailyTasksDone: number;
  workoutsDone: number;
}

interface StatItemProps {
    icon: React.ElementType;
    value: number;
    label: string;
}

function StatItem({ icon: Icon, value, label }: StatItemProps) {
    return (
        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
            <Icon className="h-8 w-8 text-primary mb-2" />
            <p className="text-3xl font-bold font-headline">{value.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    )
}

export function StatisticsCard({ xp, goalsCompleted, dailyTasksDone, workoutsDone }: StatisticsCardProps) {
  return (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <BarChartHorizontal className="h-6 w-6 text-primary" />
                <div>
                    <CardTitle className="font-headline">Your Statistics</CardTitle>
                    <CardDescription>A summary of your achievements.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatItem icon={Gem} value={xp} label="Current XP" />
                <StatItem icon={Trophy} value={goalsCompleted} label="Goals Completed" />
                <StatItem icon={CheckCircle} value={dailyTasksDone} label="Daily Tasks Done" />
                <StatItem icon={Dumbbell} value={workoutsDone} label="Workouts Done" />
            </div>
        </CardContent>
    </Card>
  );
}
