
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
      </CardContent>
    </Card>
  );
}
