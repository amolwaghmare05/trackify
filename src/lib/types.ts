import type { Timestamp } from 'firebase/firestore';

export interface Goal {
    id: string;
    userId: string;
    title: string;
    targetDays: number;
    completedDays: number;
    progress: number;
    createdAt: Timestamp;
}

export interface DailyTask {
    id: string;
    userId: string;
    goalId: string;
    title: string;
    completed: boolean;
    streak: number;
    completedAt: Timestamp | Date | null;
    createdAt: Timestamp;
}

export interface TodayTask {
    id: string;
    userId: string;
    title: string;
    completed: boolean;
    isPrimary: boolean;
    createdAt: Timestamp;
}

export interface Workout {
    id: string;
    userId: string;
    title: string;
    completed: boolean;
    streak: number;
    completedAt: Timestamp | Date | null;
    createdAt: Timestamp;
}
