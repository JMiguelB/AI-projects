export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  NONE = 'None',
}

export type RecurrenceFreq = 'none' | 'daily' | 'weekly' | 'monthly';

export interface RecurrenceRule {
  freq: RecurrenceFreq;
  until?: string; // ISO Date string (YYYY-MM-DD)
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  category: string;
  priority: Priority;
  location?: string;
  link?: string;
  contactEmail?: string;
  contactPhone?: string;
  attendees?: string[];
  autoNotified?: boolean;
  proximityAlertEnabled?: boolean;
  recurrenceRule?: RecurrenceRule;
  recurringEventId?: string;
}

export type BackgroundMode = 'single' | 'monthly';

export interface BackgroundSettings {
  mode: BackgroundMode;
  singleImage: string | null;
  monthlyImages: {
    [month: number]: string; // month is 0-11
  };
}

export type ThemeMode = 'light' | 'dark';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: Priority;
}

export type Permission = 'view' | 'edit';

export interface SharedUser {
  email: string;
  permission: Permission;
}
