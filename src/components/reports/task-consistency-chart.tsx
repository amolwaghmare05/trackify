
'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';
import type { MonthlySummary } from '@/lib/types';

const chartConfig = {
  consistency: {
    label: 'Consistency',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function TaskConsistencyChart({ data }: { data: MonthlySummary[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <TrendingUp className="h-6 w-6 mt-1 text-foreground" />
          <div>
            <CardTitle className="font-headline">Overall Task Consistency</CardTitle>
            <CardDescription>Your month-over-month task consistency.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis 
                dataKey="month" 
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
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent 
                formatter={(value) => `${value}%`}
                indicator='dot'
              />}
            />
            <Bar dataKey="consistency" fill="hsl(var(--primary))" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
