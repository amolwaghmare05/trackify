
'use client';

import { getLevelDetails } from "@/lib/levels";
import { cn } from "@/lib/utils";

interface UserBadgeProps {
  level: number;
  className?: string;
}

export function UserBadge({ level, className }: UserBadgeProps) {
  const levelInfo = getLevelDetails(level);
  const Icon = levelInfo.icon;

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full',
        className
      )}
      style={{ borderColor: levelInfo.color, backgroundColor: `${levelInfo.color}3A` }}
    >
      <Icon className="h-3/4 w-3/4" style={{ color: levelInfo.color }} />
    </div>
  );
}
