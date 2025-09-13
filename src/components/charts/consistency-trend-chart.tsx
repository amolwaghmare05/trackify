
'use client';

import { useState } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';

interface ConsistencyTrendChartProps {
  data: {
    daily: { date: string; consistency: number; isToday?: string | null }[];
    weekly: { week: string; consistency: number }[];
  };
}

const chartConfig = {
  consistency: {
    label: 'Consistency',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function ConsistencyTrendChart({ data }: ConsistencyTrendChartProps) {
  const [view, setView] = useState<'weekly' | 'daily'>('weekly');
  const monthName = format(new Date(), 'MMMM');
  const todayDate = format(new Date(), 'MMM d');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 mt-1" />
                <div>
                    <CardTitle className="font-headline">Consistency Trend</CardTitle>
                    <CardDescription>Your task consistency for {monthName}.</CardDescription>
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
                dataKey="consistency"
                stroke="var(--color-consistency)"
                strokeWidth={2}
                dot={{ r: 6, fill: 'var(--color-consistency)', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
                activeDot={{ r: 8, fill: 'var(--color-consistency)', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
              />
            </LineChart>
          )}
          {view === 'daily' && (
             <LineChart
                data={data.daily}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
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
                    dataKey="consistency"
                    stroke="var(--color-consistency)"
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
