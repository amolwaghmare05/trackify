
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { getWeek, format } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import { useMemo } from 'react';

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

  const yAxisMax = useMemo(() => {
    const maxTasks = Math.max(...data.map(item => item['Tasks Completed']), 0);
    // Ensure the axis is at least 5, and add a buffer if the max is higher.
    return Math.max(5, Math.ceil(maxTasks * 1.2));
  }, [data]);

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
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              domain={[0, yAxisMax]}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent 
                hideLabel 
                formatter={(value) => `${value}`} 
                className="rounded-md border bg-background/95 p-2 text-sm shadow-lg backdrop-blur-sm"
              />}
            />
            <Bar dataKey="Tasks Completed" fill="var(--color-tasksCompleted)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
