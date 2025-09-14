'use client';

import { Card } from '@/components/ui/card';

interface StatCardProps {
    icon: React.ElementType;
    value: number;
    label: string;
}

export function StatCard({ icon: Icon, value, label }: StatCardProps) {
    return (
        <Card className="p-4 flex items-center gap-4 bg-muted/50">
            <Icon className="h-8 w-8 text-primary" />
            <div>
                <p className="text-2xl font-bold font-headline">{value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
            </div>
        </Card>
    )
}
