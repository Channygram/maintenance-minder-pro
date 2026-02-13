// Date and time formatting utilities

import { format, formatDistanceToNow, parseISO, isToday, isTomorrow, isYesterday, differenceInDays } from 'date-fns';

export const formatDate = (dateString: string, formatStr: string = 'MMM d, yyyy'): string => {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr);
  } catch {
    return dateString;
  }
};

export const formatTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'h:mm a');
  } catch {
    return '';
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  } catch {
    return dateString;
  }
};

export const getRelativeDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateString;
  }
};

export const getFriendlyDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    
    const days = differenceInDays(date, new Date());
    if (days > 0 && days <= 7) return `In ${days} days`;
    if (days < 0 && days >= -7) return `${Math.abs(days)} days ago`;
    
    return format(date, 'MMM d');
  } catch {
    return dateString;
  }
};

export const getDayOfWeek = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'EEEE');
  } catch {
    return '';
  }
};

export const isDateInRange = (dateString: string, startDate: Date, endDate: Date): boolean => {
  try {
    const date = parseISO(dateString);
    return date >= startDate && date <= endDate;
  } catch {
    return false;
  }
};

export const getMonthYear = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMMM yyyy');
  } catch {
    return '';
  }
};

export const getShortDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'M/d/yy');
  } catch {
    return dateString;
  }
};
