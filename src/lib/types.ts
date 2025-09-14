
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

export interface CompletedGoal {
    id: string;
    userId: string;
    title: string;
    targetDays: number;
    completedAt: Timestamp | Date;
    originalCreatedAt: Timestamp;
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

export interface DailyTaskHistory {
    id: string;
    date: Timestamp;
    completed: number;
    total: number;
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

export interface WorkoutHistory {
    id: string;
    date: Timestamp;
    completed: number;
    total: number;
}

export interface UserProfile {
    uid: string;
    xp: number;
    level: number;
}

// Types for Reports Page
export interface ActivityBreakdownData {
    activity: string;
    xp: number;
    name: string;
}

export interface MonthlySummary {
    month: string;
    consistency?: number;
    discipline?: number;
}

export interface ReportsPageData {
    activityBreakdown: ActivityBreakdownData[];
    taskConsistency: MonthlySummary[];
    workoutDiscipline: MonthlySummary[];
}
