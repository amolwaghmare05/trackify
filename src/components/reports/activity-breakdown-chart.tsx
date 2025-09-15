
'use client';

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BadgePercent } from 'lucide-react';
import type { ActivityBreakdownData } from '@/lib/types';

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(56 67% 80%)', '#2cdbce'];

const chartConfig = {
  xp: {
    label: 'XP',
  },
  tasks: {
    label: 'Daily Tasks',
    color: CHART_COLORS[0],
  },
  workouts: {
    label: 'Workouts',
    color: CHART_COLORS[1],
  },
  goals: {
    label: 'Goals Completed',
    color: CHART_COLORS[2],
  },
} satisfies ChartConfig;

export function ActivityBreakdownChart({ data }: { data: ActivityBreakdownData[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <BadgePercent className="h-6 w-6 mt-1 text-foreground" />
          <div>
            <CardTitle className="font-headline">Activity Breakdown</CardTitle>
            <CardDescription>A breakdown of your total XP earned by activity.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <PieChart>
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent 
                hideLabel 
                formatter={(value, name) => `${(value as number).toLocaleString()} XP (${name})`}
              />}
            />
            <Pie data={data} dataKey="xp" nameKey="activity" innerRadius={60} strokeWidth={5}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
          {/* Color Legend with Streak XP */}
          <div className="flex flex-col items-center gap-2 mt-6">
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full" style={{ background: CHART_COLORS[0] }}></span>
                <span className="text-sm text-muted-foreground">Daily Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full" style={{ background: CHART_COLORS[1] }}></span>
                <span className="text-sm text-muted-foreground">Workouts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full" style={{ background: CHART_COLORS[2] }}></span>
                <span className="text-sm text-muted-foreground">Goals Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"></span>
                <span className="text-sm text-muted-foreground">Streak XP</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              <span>Streak XP: Earned for maintaining daily and workout streaks. The longer your streak, the more XP you earn!</span>
            </div>
          </div>
      </CardContent>
    </Card>
  );
}
