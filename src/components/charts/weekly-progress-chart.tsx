
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { getWeek, format } from 'date-fns';
import { CheckCircle } from 'lucide-react';

interface WeeklyProgressChartProps {
  data: { day: string; 'Tasks Completed': number }[];
}

const chartConfig = {
  tasksCompleted: {
    label: 'Tasks Completed',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function WeeklyProgressChart({ data }: WeeklyProgressChartProps) {
  const now = new Date();
  const weekNumber = getWeek(now, { weekStartsOn: 1 });
  const monthName = format(now, 'MMMM');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 mt-1 text-primary" />
          <div>
            <CardTitle className="font-headline">Weekly Progress</CardTitle>
            <CardDescription>
              Your completed goal tasks for Week {weekNumber} of {monthName}.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={data}>
            <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              content={<ChartTooltipContent 
                formatter={(value) => `${value} tasks`} 
              />}
            />
            <Bar dataKey="Tasks Completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
