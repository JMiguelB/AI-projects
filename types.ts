export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  NONE = 'None',
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
  autoNotified?: boolean;
  proximityAlertEnabled?: boolean;
}

export type ThemeMode = 'light' | 'dark';
