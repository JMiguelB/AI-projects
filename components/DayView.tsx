import React from 'react';
import { CalendarEvent, Priority } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onViewDirections: (location: string) => void;
  hasBackgroundImage: boolean;
}

const isSameDay = (d1: Date, d2: Date) => 
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();
  
const getPriorityColor = (priority: Priority) => {
    switch (priority) {
        case Priority.HIGH: return 'bg-red-500 border-red-700';
        case Priority.MEDIUM: return 'bg-yellow-500 border-yellow-700';
        case Priority.LOW: return 'bg-[var(--primary-500)] border-[var(--primary-700)]';
        default: return 'bg-gray-400 border-gray-600';
    }
}

export const DayView: React.FC<DayViewProps> = ({ date, events, onEventClick, onViewDirections, hasBackgroundImage }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dailyEvents = events.filter(e => isSameDay(e.start, date));
  const bgClass = hasBackgroundImage ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm' : 'bg-white dark:bg-slate-800';

  const calculateEventStyle = (event: CalendarEvent) => {
    const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
    const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
    const duration = Math.max(15, endMinutes - startMinutes); // Min duration of 15 mins for visibility

    const top = (startMinutes / 60) * 4; // 4rem per hour
    const height = (duration / 60) * 4; // 4rem per hour

    return {
      top: `${top}rem`,
      height: `${height}rem`,
    };
  };

  return (
    <div className={`flex-1 flex shadow-lg rounded-lg overflow-auto ${bgClass}`}>
      {/* Timescale */}
      <div className="w-20 text-sm text-right pr-2">
        {hours.map(hour => (
          <div key={hour} className="h-16 relative border-t border-slate-200 dark:border-slate-700 -top-px">
            <span className="relative -top-2.5 text-slate-500 dark:text-slate-400">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </span>
          </div>
        ))}
      </div>

      {/* Events Grid */}
      <div className="flex-1 relative border-l border-slate-200 dark:border-slate-700">
        {hours.map(hour => (
          <div key={hour} className="h-16 border-t border-slate-200 dark:border-slate-700"></div>
        ))}

        {dailyEvents.map(event => (
          <div
            key={event.id}
            className={`absolute left-2 right-2 p-2 rounded-lg text-white font-medium text-sm cursor-pointer z-10 border-l-4 ${getPriorityColor(event.priority)}`}
            style={calculateEventStyle(event)}
            onClick={() => onEventClick(event)}
          >
            <p className="font-bold">{event.title}</p>
            <p className="text-xs opacity-90">
                {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
             {event.location && (
              <p 
                className="text-xs mt-1 flex items-center gap-1 cursor-pointer hover:underline opacity-80"
                onClick={(e) => { e.stopPropagation(); onViewDirections(event.location); }}
              >
                <MapPinIcon className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
