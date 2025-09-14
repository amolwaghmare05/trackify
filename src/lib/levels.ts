import { Star, Gem, Shield, Crown, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const LEVEL_THRESHOLDS: { level: number; xp: number; name: string; color: string; icon: LucideIcon; description: string; }[] = [
    { level: 1, xp: 0, name: 'Bronze', color: '#CD7F32', icon: Star, description: "Just starting out." },
    { level: 2, xp: 100, name: 'Silver', color: '#C0C0C0', icon: Star, description: "Making good progress." },
    { level: 3, xp: 250, name: 'Gold', color: '#FFD700', icon: Gem, description: "Showing real dedication." },
    { level: 4, xp: 500, name: 'Platinum', color: '#E5E4E2', icon: Gem, description: "A consistent achiever." },
    { level: 5, xp: 1000, name: 'Diamond', color: '#B9F2FF', icon: Shield, description: "Master of your goals." },
    { level: 6, xp: 2000, name: 'Champion', color: '#A365E5', icon: Crown, description: "Truly unstoppable." },
];

export interface UserLevel {
    level: number;
    name: string;
    xpForCurrentLevel: number;
    xpForNextLevel: number;
}

export const getLevelDetails = (level: number) => {
    const levelData = LEVEL_THRESHOLDS.find(l => l.level === level);
    if (levelData) {
      return {
        name: levelData.name,
        color: levelData.color,
        icon: levelData.icon,
      };
    }
    // Return a default for unknown levels to prevent crashes
    return {
      name: 'User',
      color: '#808080', // A neutral gray color
      icon: User,
    };
  };

export const calculateLevel = (xp: number): UserLevel => {
  let userLevel = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      userLevel = LEVEL_THRESHOLDS[i].level;
      break;
    }
  }

  const currentLevelInfo = LEVEL_THRESHOLDS.find(l => l.level === userLevel);
  const nextLevelInfo = LEVEL_THRESHOLDS.find(l => l.level === userLevel + 1);

  return {
    level: userLevel,
    name: currentLevelInfo?.name || 'Bronze',
    xpForCurrentLevel: currentLevelInfo?.xp || 0,
    xpForNextLevel: nextLevelInfo?.xp || currentLevelInfo?.xp || 0,
  };
};
