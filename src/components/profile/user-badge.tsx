'use client';

import { getLevelDetails } from "@/lib/levels";

interface UserBadgeProps {
  level: number;
  className?: string;
}

export function UserBadge({ level, className }: UserBadgeProps) {
  const levelInfo = getLevelDetails(level);
  const Icon = levelInfo.icon;

  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${className}`}
      style={{ borderColor: levelInfo.color, backgroundColor: `${levelInfo.color}1A` }}
    >
      <Icon className="h-5 w-5" style={{ color: levelInfo.color }} />
    </div>
  );
}
