
'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getLevelDetails } from "@/lib/levels";
import { Star, Gem, Shield, Crown } from 'lucide-react';

interface LevelAvatarProps {
    level: number;
    className?: string;
}

export function LevelAvatar({ level, className }: LevelAvatarProps) {
    const levelInfo = getLevelDetails(level);
    const Icon = levelInfo.icon;

    return (
        <Avatar className={cn("h-24 w-24 border-4", className)} style={{ borderColor: levelInfo.color }}>
            <AvatarFallback className="flex flex-col items-center justify-center bg-background p-2">
                <Icon className="h-1/2 w-1/2" style={{ color: levelInfo.color }} />
                <span className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: levelInfo.color }}>
                    {levelInfo.name}
                </span>
            </AvatarFallback>
        </Avatar>
    );
}
