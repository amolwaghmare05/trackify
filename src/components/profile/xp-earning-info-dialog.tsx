
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Flame, Trophy, CheckSquare, Dumbbell, Star } from 'lucide-react';

interface LevelXpDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const xpRules = [
  {
    icon: Trophy,
    title: 'Goal Completion',
    xp: '30 XP',
    description: 'Awarded when you successfully complete all days for a goal.',
  },
  {
    icon: CheckSquare,
    title: 'Goal-Related Daily Task',
    xp: '5 XP',
    description: 'Base XP for completing a daily task associated with a goal.',
  },
  {
    icon: Dumbbell,
    title: 'Daily Workout',
    xp: '5 XP',
    description: 'Base XP for completing one of your daily workouts.',
  },
  {
    icon: CheckSquare,
    title: "Today's List Task",
    xp: '2 XP',
    description: 'Awarded for completing a miscellaneous task from your dashboard list.',
  },
  {
    icon: Flame,
    title: 'Streak Bonuses',
    xp: '+5 to +30 XP',
    description: 'Bonus XP is added to goal tasks and workouts at streak milestones (3, 7, 15, and 30 days).',
  },
];

export function XpEarningInfoDialog({ isOpen, onOpenChange }: LevelXpDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">How to Earn XP</DialogTitle>
          <DialogDescription>
            XP (Experience Points) helps you level up. Here's how you can earn it.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full pr-4">
          <div className="space-y-4 py-4">
            {xpRules.map((rule) => (
              <div key={rule.title} className="flex items-start gap-4 p-2 rounded-md bg-muted/50">
                <div className="flex-shrink-0 pt-1">
                    <rule.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{rule.title}</p>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{rule.xp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
