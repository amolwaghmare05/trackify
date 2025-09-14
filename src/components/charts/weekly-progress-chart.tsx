
'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { getWeekOfMonth, format } from 'date-fns';
import { CheckCircle } from 'lucide-react';

interface WeeklyProgressChartProps {
  data: {
    data: { day: string; 'Tasks Completed': number }[];
    yAxisMax: number;
  };
}

const chartConfig = {
  tasksCompleted: {
    label: 'Tasks Completed',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function WeeklyProgressChart({ data }: WeeklyProgressChartProps) {
  const now = new Date();
  const weekNumber = getWeekOfMonth(now, { weekStartsOn: 1 });
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
          <BarChart data={data.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis 
                dataKey="day" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              domain={[0, data.yAxisMax]}
              allowDecimals={false}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent 
                formatter={(value) => `${value} tasks`}
                indicator='dot'
              />}
            />
            <Bar dataKey="Tasks Completed" fill="hsl(var(--primary))" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
