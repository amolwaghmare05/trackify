
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LEVEL_THRESHOLDS } from '@/lib/levels';
import { UserBadge } from './user-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Trophy, CheckSquare, Dumbbell } from 'lucide-react';

interface StatsInfoDialogProps {
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


export function StatsInfoDialog({ isOpen, onOpenChange }: StatsInfoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Progression Information</DialogTitle>
          <DialogDescription>
            Details on how to earn XP and the requirements for each level.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="xp-earning">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="xp-earning">XP Earning</TabsTrigger>
                <TabsTrigger value="levels">Level Info</TabsTrigger>
            </TabsList>
            <TabsContent value="xp-earning">
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
            </TabsContent>
            <TabsContent value="levels">
                <ScrollArea className="h-72 w-full pr-4">
                    <div className="space-y-4 py-4">
                        {LEVEL_THRESHOLDS.map((level) => (
                        <div key={level.level} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <div className="flex items-center gap-4">
                            <UserBadge level={level.level} />
                            <div>
                                <p className="font-semibold">Level {level.level}: {level.name}</p>
                                <p className="text-sm text-muted-foreground">{level.description}</p>
                            </div>
                            </div>
                            <div className="text-right">
                            <p className="font-bold text-primary">{level.xp.toLocaleString()} XP</p>
                            <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </ScrollArea>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
