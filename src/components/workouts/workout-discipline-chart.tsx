
'use client';

import { useState } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

interface WorkoutDisciplineChartProps {
  data: {
    daily: { date: string; discipline: number; isToday?: string | null }[];
    weekly: { week: string; discipline: number }[];
  };
}

const chartConfig = {
  discipline: {
    label: 'Discipline',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function WorkoutDisciplineChart({ data }: WorkoutDisciplineChartProps) {
  const [view, setView] = useState<'weekly' | 'daily'>('weekly');
  const monthName = format(new Date(), 'MMMM');
  const todayDate = format(new Date(), 'MMM d');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
                <Activity className="h-6 w-6 mt-1 text-foreground" />
                <div>
                    <CardTitle className="font-headline">Workout Discipline</CardTitle>
                    <CardDescription>Your workout consistency for {monthName}.</CardDescription>
                </div>
            </div>
          <Tabs value={view} onValueChange={(value) => setView(value as 'weekly' | 'daily')} className="w-auto">
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="daily">Daily</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          {view === 'weekly' && (
            <LineChart
              data={data.weekly}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="week" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '3 3' }}
                content={<ChartTooltipContent formatter={(value) => `${value}%`} hideIndicator />}
              />
              <Line
                type="monotone"
                dataKey="discipline"
                stroke="var(--color-discipline)"
                strokeWidth={2}
                dot={{ r: 6, fill: 'var(--color-discipline)', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
                activeDot={{ r: 8, fill: 'var(--color-discipline)', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
              />
            </LineChart>
          )}
          {view === 'daily' && (
             <LineChart
                data={data.daily}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '3 3' }}
                    content={<ChartTooltipContent formatter={(value) => `${value}%`} hideIndicator />}
                />
                <ReferenceLine x={todayDate} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <Line
                    type="monotone"
                    dataKey="discipline"
                    stroke="var(--color-discipline)"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
