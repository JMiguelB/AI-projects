
import React, { useState } from 'react';
import { CalendarEvent, Priority } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onViewDirections: (location: string) => void;
  onScheduleTask: (taskId: string, targetDate: Date) => void;
  hasBackgroundImage: boolean;
}
  
const getPriorityColor = (priority: Priority) => {
    switch (priority) {
        case Priority.HIGH: return 'bg-red-500 border-red-700';
        case Priority.MEDIUM: return 'bg-yellow-500 border-yellow-700';
        case Priority.LOW: return 'bg-[var(--primary-500)] border-[var(--primary-700)]';
        default: return 'bg-gray-400 border-gray-600';
    }
}

export const DayView: React.FC<DayViewProps> = ({ date, events, onEventClick, onViewDirections, onScheduleTask, hasBackgroundImage }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const bgClass = hasBackgroundImage ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm' : 'bg-white dark:bg-slate-800';
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const dailyEvents = events.filter(e => e.start <= dayEnd && e.end > dayStart);

  const calculateEventStyle = (event: CalendarEvent) => {
    const dayStartMs = new Date(date).setHours(0, 0, 0, 0);

    const eventStartMs = Math.max(dayStartMs, event.start.getTime());
    const eventEndMs = Math.min(new Date(date).setHours(23, 59, 59, 999), event.end.getTime());

    const startMinutes = (eventStartMs - dayStartMs) / (1000 * 60);
    const durationMinutes = (eventEndMs - eventStartMs) / (1000 * 60);
    
    const top = (startMinutes / 60) * 4; // 4rem per hour
    const height = (Math.max(15, durationMinutes) / 60) * 4;

    return {
      top: `${top}rem`,
      height: `${height}rem`,
    };
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const data = e.dataTransfer.getData('text/plain');

    if (data.startsWith('task-')) {
      const taskId = data.substring(5);
      const grid = e.currentTarget as HTMLDivElement;
      const rect = grid.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const totalMinutes = (y / rect.height) * 24 * 60;
      
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      
      const targetDate = new Date(date);
      targetDate.setHours(hours, minutes, 0, 0);

      onScheduleTask(taskId, targetDate);
    }
  };

  return (
    <div className={`flex-1 flex shadow-lg rounded-lg overflow-auto ${bgClass}`}>
      {/* Timescale */}
      <div className="w-16 sm:w-20 text-xs sm:text-sm text-right pr-2">
        {hours.map(hour => (
          <div key={hour} className="h-16 relative border-t border-slate-200 dark:border-slate-700 -top-px">
            <span className="relative -top-2.5 text-slate-500 dark:text-slate-400">
              <span className="hidden sm:inline">{hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}</span>
              <span className="sm:hidden">{hour % 12 === 0 ? 12 : hour % 12}{hour < 12 ? 'a' : 'p'}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Events Grid */}
      <div 
        className={`flex-1 relative border-l border-slate-200 dark:border-slate-700 ${isDraggingOver ? 'bg-sky-50/50 dark:bg-sky-900/20' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
      >
        {hours.map(hour => (
          <div key={hour} className="h-16 border-t border-slate-200 dark:border-slate-700"></div>
        ))}

        {dailyEvents.map(event => (
          <div
            key={event.id}
            className={`absolute left-2 right-2 p-2 rounded-lg text-white text-xs sm:text-sm cursor-pointer z-10 border-l-4 ${getPriorityColor(event.priority)}`}
            style={calculateEventStyle(event)}
            onClick={() => onEventClick(event)}
          >
            <p className="font-bold">{event.title}</p>
            <p className="text-xs opacity-90 hidden sm:block">
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
