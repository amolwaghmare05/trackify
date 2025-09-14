
'use client';

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Gem } from 'lucide-react';
import type { XpDataPoint } from '@/lib/types';

const chartConfig = {
  xp: {
    label: 'Total XP',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function XpGrowthChart({ data }: { data: XpDataPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Gem className="h-6 w-6 mt-1 text-primary" />
          <div>
            <CardTitle className="font-headline">XP Growth Over Time</CardTitle>
            <CardDescription>Your total accumulated XP since you started.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
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
              tickFormatter={(value) => (value as number).toLocaleString()}
            />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }}
              content={<ChartTooltipContent 
                formatter={(value) => `${(value as number).toLocaleString()} XP`}
                hideIndicator
              />}
            />
             <defs>
                <linearGradient id="fillXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
            </defs>
            <Area
                type="monotone"
                dataKey="xp"
                stroke="hsl(var(--primary))"
                fill="url(#fillXp)"
                strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
