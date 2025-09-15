
'use client';

import { Progress } from '@/components/ui/progress';

interface XpProgressBarProps {
  currentXp: number;
  level: number;
  levelName: string;
  xpForNextLevel: number;
  xpForCurrentLevel: number;
}

export function XpProgressBar({
  currentXp,
  level,
  levelName,
  xpForNextLevel,
  xpForCurrentLevel,
}: XpProgressBarProps) {
  const progressPercentage =
    xpForNextLevel > xpForCurrentLevel
      ? ((currentXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
      : 100;

  const xpNeeded = xpForNextLevel - currentXp;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
        <span className="font-semibold">Level {level} ({levelName})</span>
        {xpForNextLevel > currentXp ? (
            <span>
                <span className="font-bold">{xpNeeded.toLocaleString()}</span> XP to Level {level + 1}
            </span>
        ) : (
            <span className="font-bold">Max Level Reached!</span>
        )}
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}
