
import React from 'react';
import { WEEKDAYS } from '../constants';
import { CalendarEvent, Priority } from '../types';

interface CalendarViewProps {
  days: Date[];
  currentMonth: number;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventUpdate: (event: CalendarEvent) => void;
  onScheduleTask: (taskId: string, targetDate: Date) => void;
  hasBackgroundImage: boolean;
}

const isSameDay = (d1: Date, d2: Date) => 
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const isToday = (date: Date) => isSameDay(date, new Date());

const getPriorityColor = (priority: Priority) => {
    switch (priority) {
        case Priority.HIGH: return 'bg-red-500';
        case Priority.MEDIUM: return 'bg-yellow-500';
        case Priority.LOW: return 'bg-[var(--primary-500)]';
        default: return 'bg-gray-400';
    }
}

export const CalendarView: React.FC<CalendarViewProps> = ({ days, currentMonth, events, onDayClick, onEventClick, onEventUpdate, onScheduleTask, hasBackgroundImage }) => {
  const dayCellBg = hasBackgroundImage ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm' : 'bg-white dark:bg-slate-800';
  const otherMonthDayCellBg = hasBackgroundImage ? 'bg-slate-50/80 dark:bg-slate-800/60 backdrop-blur-sm' : 'bg-slate-50 dark:bg-slate-800/50';
  const [dragOverDay, setDragOverDay] = React.useState<Date | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, event: CalendarEvent) => {
    e.dataTransfer.setData('text/plain', `event-${event.id}`);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, day: Date) => {
    e.preventDefault();
    setDragOverDay(null);
    const data = e.dataTransfer.getData('text/plain');
    
    if (data.startsWith('event-')) {
      const eventId = data.substring(6);
      const event = events.find(ev => ev.id === eventId);
      if (!event) return;

      const newStart = new Date(day);
      newStart.setHours(event.start.getHours(), event.start.getMinutes(), event.start.getSeconds(), event.start.getMilliseconds());

      const duration = event.end.getTime() - event.start.getTime();
      const newEnd = new Date(newStart.getTime() + duration);
      
      onEventUpdate({ ...event, start: newStart, end: newEnd });
    } else if (data.startsWith('task-')) {
      const taskId = data.substring(5);
      const targetDate = new Date(day);
      targetDate.setHours(9, 0, 0, 0); // Default to 9 AM
      onScheduleTask(taskId, targetDate);
    }
  };

  return (
    <div className="flex-1 grid grid-cols-7 grid-rows-auto shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      {WEEKDAYS.map(day => (
        <div key={day} className={`text-center font-semibold text-sm text-slate-600 dark:text-slate-300 py-3 border-b border-r border-slate-200 dark:border-slate-700 ${dayCellBg}`}>
          <span className="hidden sm:inline">{day}</span>
          <span className="sm:hidden">{day.charAt(0)}</span>
        </div>
      ))}
      
      {days.map((day, index) => {
        const isCurrentMonth = day.getMonth() === currentMonth;
        const today = isToday(day);
        const dailyEvents = events
            .filter(e => {
                const dayStart = new Date(day);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(day);
                dayEnd.setHours(23, 59, 59, 999);
                return e.start <= dayEnd && e.end > dayStart;
            })
            .sort((a,b) => a.start.getTime() - b.start.getTime());
        const isDragOver = dragOverDay && isSameDay(dragOverDay, day);

        return (
          <div
            key={index}
            className={`border-b border-r border-slate-200 dark:border-slate-700 p-1 sm:p-2 flex flex-col gap-1 min-h-[90px] md:min-h-[120px] ${isCurrentMonth ? dayCellBg : otherMonthDayCellBg} transition-colors hover:bg-sky-50/80 dark:hover:bg-sky-900/50 cursor-pointer ${isDragOver ? 'ring-2 ring-[var(--primary-500)] ring-inset' : ''}`}
            onClick={() => onDayClick(day)}
            onDragOver={(e) => { e.preventDefault(); setDragOverDay(day); }}
            onDragLeave={() => setDragOverDay(null)}
            onDrop={(e) => handleDrop(e, day)}
          >
            <span className={`self-end text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${today ? 'bg-[var(--primary-600)] text-white' : 'text-slate-600 dark:text-slate-300'}`}>
              {day.getDate()}
            </span>
            <div className="flex-1 overflow-y-auto space-y-1">
                {dailyEvents.map(event => (
                    <div 
                        key={event.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, event)}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                        className="p-1.5 rounded-md text-white text-xs font-medium cursor-grab active:cursor-grabbing flex items-center gap-2 bg-[var(--primary-500)] hover:bg-[var(--primary-600)]"
                    >
                       <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)} flex-shrink-0`}></div>
                       <span className="truncate">{event.title}</span>
                    </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
