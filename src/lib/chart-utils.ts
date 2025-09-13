import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  getWeekOfMonth,
  getWeeksInMonth,
  isSameDay,
} from 'date-fns';
import type { DailyTask } from './types';

function getTaskDate(task: DailyTask): Date | null {
    if (!task.completedAt) return null;
    if (task.completedAt instanceof Date) {
        return task.completedAt;
    }
    // Handle Firestore Timestamp
    if ('seconds' in task.completedAt && typeof task.completedAt.seconds === 'number') {
        return new Date(task.completedAt.seconds * 1000);
    }
    return null;
}

export const processTasksForCharts = (tasks: DailyTask[]) => {
  const now = new Date();

  // --- Weekly Progress ---
  const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

  const weeklyProgress = daysInWeek.map(day => {
    const completedTasks = tasks.filter(task => {
      if (!task.completed) return false;
      const taskDate = getTaskDate(task);
      return taskDate && isSameDay(taskDate, day);
    });
    return {
      day: format(day, 'EEE'),
      'Tasks Completed': completedTasks.length,
    };
  });

  // --- Consistency Trend ---
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: startOfCurrentMonth, end: endOfCurrentMonth });

  // Daily Consistency
  const dailyConsistency = daysInMonth.map(day => {
    const totalTasksForDay = tasks.filter(task => {
        const createdAtDate = getTaskDate({ ...task, completedAt: task.createdAt });
        return createdAtDate && createdAtDate <= day;
    });
    const completedTasksForDay = tasks.filter(task => {
        const taskDate = getTaskDate(task);
        return taskDate && isSameDay(taskDate, day);
    });
    
    const totalScheduled = new Set(totalTasksForDay.map(t => t.id)).size;
    const consistency = totalScheduled > 0 ? (completedTasksForDay.length / totalScheduled) * 100 : 0;
    
    return {
        date: format(day, 'MMM d'),
        consistency: Math.round(consistency),
        isToday: isSameDay(day, now) ? 'today' : null,
    };
  });

  // Weekly Consistency
  const weeksInMonth = getWeeksInMonth(now, { weekStartsOn: 1 });
  const weeklyConsistency = Array.from({ length: weeksInMonth }, (_, i) => {
    const weekNumber = i + 1;
    const tasksInWeek = tasks.filter(task => {
        const taskCreationDate = getTaskDate({ ...task, completedAt: task.createdAt });
        if (!taskCreationDate) return false;
        const taskWeek = getWeekOfMonth(taskCreationDate, { weekStartsOn: 1 });
        return taskWeek === weekNumber && isWithinInterval(taskCreationDate, {start: startOfCurrentMonth, end: endOfCurrentMonth});
    });

    const completedTasksInWeek = tasksInWeek.filter(task => {
      return task.completed && getTaskDate(task);
    });

    const totalScheduled = new Set(tasksInWeek.map(t => t.id)).size;
    const consistency = totalScheduled > 0 ? (completedTasksInWeek.length / totalScheduled) * 100 : 0;
    
    return {
      week: `Week ${weekNumber}`,
      consistency: Math.round(consistency),
    };
  });

  return {
    weeklyProgress,
    consistencyTrend: {
      daily: dailyConsistency,
      weekly: weeklyConsistency,
    },
  };
};
