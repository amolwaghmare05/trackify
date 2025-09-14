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
import type { DailyTask, Workout } from './types';

function getTaskDate(task: DailyTask | Workout): Date | null {
    const dateField = task.completedAt || task.createdAt;
    if (!dateField) return null;
    if (dateField instanceof Date) {
        return dateField;
    }
    // Handle Firestore Timestamp
    if ('seconds' in dateField && typeof dateField.seconds === 'number') {
        return new Date(dateField.seconds * 1000);
    }
    return null;
}

export const processTasksForCharts = (tasks: DailyTask[]) => {
  const now = new Date();

  // --- Weekly Progress ---
  const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
  const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

  const weeklyProgressData = daysInWeek.map(day => {
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

  const maxCompleted = max(weeklyProgressData.map(d => d['Tasks Completed']));
  const yAxisMax = Math.max(5, Math.ceil((maxCompleted?.valueOf() || 0) * 1.2));


  // --- Consistency Trend ---
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: startOfCurrentMonth, end: endOfCurrentMonth });

  // Daily Consistency
  const dailyConsistency = daysInMonth.map(day => {
    const tasksCreatedByDay = tasks.filter(task => {
        const createdAtDate = getTaskDate({ ...task, completedAt: task.createdAt });
        return createdAtDate && createdAtDate <= day;
    });

    const uniqueTaskTitles = [...new Set(tasksCreatedByDay.map(t => t.title))];

    const completedTasksForDay = tasks.filter(task => {
        if (!task.completed) return false;
        const taskDate = getTaskDate(task);
        return taskDate && isSameDay(taskDate, day);
    });
    
    const totalScheduled = uniqueTaskTitles.length;
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
    
    const startOfWeekInMonth = startOfWeek(new Date(now.getFullYear(), now.getMonth(), 1 + i * 7), { weekStartsOn: 1 });
    const endOfWeekInMonth = endOfWeek(startOfWeekInMonth, { weekStartsOn: 1 });

    const tasksCreatedByWeek = tasks.filter(task => {
        const createdAtDate = getTaskDate({ ...task, completedAt: task.createdAt });
        return createdAtDate && createdAtDate <= endOfWeekInMonth;
    });
    
    const uniqueTaskTitlesInWeek = [...new Set(tasksCreatedByWeek.map(t => t.title))];

    const completedTasksInWeek = tasks.filter(task => {
        if (!task.completed) return false;
        const taskDate = getTaskDate(task);
        return taskDate && isWithinInterval(taskDate, { start: startOfWeekInMonth, end: endOfWeekInMonth });
    });
    
    const totalScheduled = uniqueTaskTitlesInWeek.length * 7;
    const consistency = totalScheduled > 0 ? (completedTasksInWeek.length / totalScheduled) * 100 : 0;
    
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


export const processWorkoutsForChart = (workouts: Workout[]) => {
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: startOfCurrentMonth, end: endOfCurrentMonth });

  // Daily Discipline
  const dailyDiscipline = daysInMonth.map(day => {
    // Find all workouts that existed on or before this day
    const workoutsScheduled = workouts.filter(w => {
      const creationDate = getTaskDate({ ...w, completedAt: w.createdAt });
      return creationDate && creationDate <= day;
    });
    
    // Find all workouts completed on this specific day
    const workoutsCompleted = workouts.filter(w => {
      if (!w.completed) return false;
      const completionDate = getTaskDate(w);
      return completionDate && isSameDay(completionDate, day);
    });

    const totalScheduled = workoutsScheduled.length;
    const discipline = totalScheduled > 0 ? (workoutsCompleted.length / totalScheduled) * 100 : 0;

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

    let totalPossibleCheckIns = 0;
    let totalCompletedCheckIns = 0;

    eachDayOfInterval({ start: startOfWeekInMonth, end: endOfWeekInMonth }).forEach(day => {
      if (day > endOfCurrentMonth) return;

      const workoutsScheduledForDay = workouts.filter(w => {
        const creationDate = getTaskDate({ ...w, completedAt: w.createdAt });
        return creationDate && creationDate <= day;
      }).length;

      const workoutsCompletedForDay = workouts.filter(w => {
        if (!w.completed) return false;
        const completionDate = getTaskDate(w);
        return completionDate && isSameDay(completionDate, day);
      }).length;

      totalPossibleCheckIns += workoutsScheduledForDay;
      totalCompletedCheckIns += workoutsCompletedForDay;
    });

    const discipline = totalPossibleCheckIns > 0 ? (totalCompletedCheckIns / totalPossibleCheckIns) * 100 : 0;

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
