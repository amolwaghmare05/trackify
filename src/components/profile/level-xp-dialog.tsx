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

interface LevelXpDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function LevelXpDialog({ isOpen, onOpenChange }: LevelXpDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Level & XP Requirements</DialogTitle>
          <DialogDescription>
            Here's the XP you need to reach each level in your journey.
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}
