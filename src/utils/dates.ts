import { format, formatDistanceToNow, addDays, isBefore, isAfter, parseISO, differenceInDays } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
};

export const formatShortDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
};

export const formatRelative = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
};

export const getNextDueDate = (lastCompleted: string | undefined, intervalDays: number): string => {
  if (!lastCompleted || intervalDays === 0) {
    return new Date().toISOString();
  }
  const last = parseISO(lastCompleted);
  return addDays(last, intervalDays).toISOString();
};

export const isOverdue = (dueDate: string): boolean => {
  return isBefore(parseISO(dueDate), new Date());
};

export const isDueSoon = (dueDate: string, days: number = 7): boolean => {
  const due = parseISO(dueDate);
  const now = new Date();
  const threshold = addDays(now, days);
  return isAfter(due, now) && isBefore(due, threshold);
};

export const getDaysUntilDue = (dueDate: string): number => {
  return differenceInDays(parseISO(dueDate), new Date());
};

export const toISOString = (date: Date = new Date()): string => {
  return date.toISOString();
};
