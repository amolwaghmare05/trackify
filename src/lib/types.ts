import type { Timestamp } from 'firebase/firestore';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetDays: number;
  progress: number; // Percentage
  createdAt: Timestamp;
}

export interface DailyTask {
  id: string;
  userId: string;
  goalId: string;
  title: string;
  completed: boolean;
  streak: number;
  lastCompleted: Timestamp | null;
  createdAt: Timestamp;
}
