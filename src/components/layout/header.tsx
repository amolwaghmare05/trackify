import { Target, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onAddGoal: () => void;
}

export function Header({ onAddGoal }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-6xl items-center mx-auto px-4">
        <div className="mr-4 flex items-center">
          <Target className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-xl font-bold font-headline">Triumph Track</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button onClick={onAddGoal}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Goal
          </Button>
        </div>
      </div>
    </header>
  );
}
