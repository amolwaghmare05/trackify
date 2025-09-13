'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltipContent } from '@/components/ui/chart';
import { getWeek, format } from 'date-fns';
import { CheckCircle } from 'lucide-react';

interface WeeklyProgressChartProps {
  data: { day: string; 'Tasks Completed': number }[];
}

export function WeeklyProgressChart({ data }: WeeklyProgressChartProps) {
  const now = new Date();
  const weekNumber = getWeek(now);
  const monthName = format(now, 'MMMM');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 mt-1" />
          <div>
            <CardTitle className="font-headline">Weekly Progress</CardTitle>
            <CardDescription>
              Your completed goal tasks for Week {weekNumber} of {monthName}.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))', radius: 'var(--radius)' }}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="Tasks Completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
