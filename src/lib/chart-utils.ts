
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
  max,
} from 'date-fns';
import type { DailyTaskHistory, WorkoutHistory } from './types';

function getHistoryDate(historyItem: DailyTaskHistory | WorkoutHistory): Date {
    const dateField = historyItem.date;
    if (dateField instanceof Date) {
        return dateField;
    }
    // Handle Firestore Timestamp
    if ('seconds' in dateField && typeof dateField.seconds === 'number') {
        return new Date(dateField.seconds * 1000);
    }
    // Fallback for string date (though Timestamp is expected)
    return new Date(dateField as any);
}


export const processTasksForCharts = (history: DailyTaskHistory[]) => {
  const now = new Date();
  const historyMap = new Map(history.map(h => [format(getHistoryDate(h), 'yyyy-MM-dd'), h]));

  // --- Weekly Progress ---
  const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

  const weeklyProgressData = daysInWeek.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const historyEntry = historyMap.get(dayStr);
    return {
      day: format(day, 'EEE'),
      'Tasks Completed': historyEntry ? historyEntry.completed : 0,
    };
  });

  const maxCompleted = max(weeklyProgressData.map(d => d['Tasks Completed']));
  const yAxisMax = Math.max(5, Math.ceil((maxCompleted?.valueOf() || 0) * 1.2));

  // --- Consistency Trend ---
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: startOfCurrentMonth, end: endOfCurrentMonth });

  // Daily Consistency
  const dailyConsistency = daysInMonth.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const historyEntry = historyMap.get(dayStr);
    const consistency = historyEntry && historyEntry.total > 0
        ? (historyEntry.completed / historyEntry.total) * 100
        : 0;
    
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
    const startOfWeekInMonth = startOfWeek(new Date(now.getFullYear(), now.getMonth(), 1 + i * 7), { weekStartsOn: 1 });
    const endOfWeekInMonth = endOfWeek(startOfWeekInMonth, { weekStartsOn: 1 });

    const daysInThisWeek = eachDayOfInterval({ start: startOfWeekInMonth, end: endOfWeekInMonth });
    
    let totalCompleted = 0;
    let totalPossible = 0;

    daysInThisWeek.forEach(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const historyEntry = historyMap.get(dayStr);
        if (historyEntry) {
            totalCompleted += historyEntry.completed;
            totalPossible += historyEntry.total;
        }
    });

    const consistency = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
    
    return {
      week: `Week ${weekNumber}`,
      consistency: Math.round(consistency),
    };
  });

  return {
    weeklyProgress: {
        data: weeklyProgressData,
        yAxisMax,
    },
    consistencyTrend: {
      daily: dailyConsistency,
      weekly: weeklyConsistency,
    },
  };
};

export const processWorkoutsForChart = (history: WorkoutHistory[]) => {
  const now = new Date();
  const historyMap = new Map(history.map(h => [format(getHistoryDate(h), 'yyyy-MM-dd'), h]));
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: startOfCurrentMonth, end: endOfCurrentMonth });

  // Daily Discipline
  const dailyDiscipline = daysInMonth.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const historyEntry = historyMap.get(dayStr);
    const discipline = historyEntry && historyEntry.total > 0
        ? (historyEntry.completed / historyEntry.total) * 100
        : 0;
    
    return {
      date: format(day, 'MMM d'),
      discipline: Math.round(discipline),
      isToday: isSameDay(day, now) ? 'today' : null,
    };
  });

  // Weekly Discipline
  const weeksInMonth = getWeeksInMonth(now, { weekStartsOn: 1 });
  const weeklyDiscipline = Array.from({ length: weeksInMonth }, (_, i) => {
    const weekNumber = i + 1;
    const startOfWeekInMonth = startOfWeek(new Date(now.getFullYear(), now.getMonth(), 1 + i * 7), { weekStartsOn: 1 });
    const endOfWeekInMonth = endOfWeek(startOfWeekInMonth, { weekStartsOn: 1 });

    let totalCompleted = 0;
    let totalPossible = 0;
    
    eachDayOfInterval({ start: startOfWeekInMonth, end: endOfWeekInMonth }).forEach(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const historyEntry = historyMap.get(dayStr);
        if (historyEntry) {
            totalCompleted += historyEntry.completed;
            totalPossible += historyEntry.total;
        }
    });

    const discipline = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

    return {
      week: `Week ${weekNumber}`,
      discipline: Math.round(discipline),
    };
  });

  return {
    daily: dailyDiscipline,
    weekly: weeklyDiscipline,
  };
};
