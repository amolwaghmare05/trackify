
import { format, getMonth, getYear, startOfDay } from 'date-fns';
import type { DailyTaskHistory, WorkoutHistory, CompletedGoal, ActivityBreakdownData, MonthlySummary } from './types';

// XP constants
const XP_PER_WORKOUT = 10;
const XP_PER_TASK = 5;
const XP_PER_GOAL = 50;

function getHistoryDate(historyItem: DailyTaskHistory | WorkoutHistory | CompletedGoal): Date {
    const dateField = (historyItem as any).date || (historyItem as any).completedAt;
    if (!dateField) return new Date();
    if (dateField instanceof Date) {
        return dateField;
    }
    if (dateField.seconds) {
        return new Date(dateField.seconds * 1000);
    }
    return new Date(dateField);
}

export const processHistoryForReports = (
    taskHistory: DailyTaskHistory[],
    workoutHistory: WorkoutHistory[],
    completedGoals: CompletedGoal[]
) => {
    // 1. Activity Breakdown
    const totalTaskXp = taskHistory.reduce((sum, item) => sum + item.completed, 0) * XP_PER_TASK;
    const totalWorkoutXp = workoutHistory.reduce((sum, item) => sum + item.completed, 0) * XP_PER_WORKOUT;
    const totalGoalXp = completedGoals.length * XP_PER_GOAL;

    const activityBreakdown: ActivityBreakdownData[] = [
        { activity: 'Daily Tasks', xp: totalTaskXp, name: `${(totalTaskXp).toLocaleString()} XP` },
        { activity: 'Workouts', xp: totalWorkoutXp, name: `${(totalWorkoutXp).toLocaleString()} XP` },
        { activity: 'Goals Completed', xp: totalGoalXp, name: `${(totalGoalXp).toLocaleString()} XP` },
    ].filter(item => item.xp > 0);


    // --- Helper for monthly aggregation ---
    const aggregateMonthly = (history: (DailyTaskHistory | WorkoutHistory)[]) => {
        const monthlyData: { [key: string]: { completed: number; total: number } } = {};

        history.forEach(item => {
            const date = getHistoryDate(item);
            const key = format(date, 'MMM yyyy');
            if (!monthlyData[key]) {
                monthlyData[key] = { completed: 0, total: 0 };
            }
            monthlyData[key].completed += item.completed;
            monthlyData[key].total += item.total;
        });

        return Object.entries(monthlyData).map(([month, data]) => ({
            month,
            percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
        }));
    };

    // 2. Task Consistency & 3. Workout Discipline
    const taskConsistencyMonthly = aggregateMonthly(taskHistory);
    const workoutDisciplineMonthly = aggregateMonthly(workoutHistory);
    
    const taskConsistency: MonthlySummary[] = taskConsistencyMonthly.map(d => ({ month: d.month, consistency: d.percentage }));
    const workoutDiscipline: MonthlySummary[] = workoutDisciplineMonthly.map(d => ({ month: d.month, discipline: d.percentage }));


    return {
        activityBreakdown,
        taskConsistency,
        workoutDiscipline,
    };
};
