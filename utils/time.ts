import { CalendarEvent } from '../types';

/**
 * Checks if two calendar events have overlapping time ranges.
 * @param eventA The first event.
 * @param eventB The second event.
 * @returns True if the events overlap, false otherwise.
 */
export const isOverlapping = (eventA: CalendarEvent, eventB: CalendarEvent): boolean => {
  return eventA.start < eventB.end && eventA.end > eventB.start;
};
