import type { Timestamp } from 'firebase/firestore';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetDays: number;
  progress: number; // Percentage
  createdAt: Timestamp;
}
