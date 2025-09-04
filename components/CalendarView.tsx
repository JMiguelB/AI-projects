import React from 'react';
import { WEEKDAYS } from '../constants';
import { CalendarEvent, Priority } from '../types';

interface CalendarViewProps {
  days: Date[];
  currentMonth: number;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
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

export const CalendarView: React.FC<CalendarViewProps> = ({ days, currentMonth, events, onDayClick, onEventClick, hasBackgroundImage }) => {
  const dayCellBg = hasBackgroundImage ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm' : 'bg-white dark:bg-slate-800';
  const otherMonthDayCellBg = hasBackgroundImage ? 'bg-slate-50/80 dark:bg-slate-800/60 backdrop-blur-sm' : 'bg-slate-50 dark:bg-slate-800/50';

  return (
    <div className="flex-1 grid grid-cols-7 grid-rows-auto shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      {WEEKDAYS.map(day => (
        <div key={day} className={`text-center font-semibold text-sm text-slate-600 dark:text-slate-300 py-3 border-b border-r border-slate-200 dark:border-slate-700 ${dayCellBg}`}>
          {day}
        </div>
      ))}
      
      {days.map((day, index) => {
        const isCurrentMonth = day.getMonth() === currentMonth;
        const today = isToday(day);
        const dailyEvents = events
            .filter(e => isSameDay(e.start, day))
            .sort((a,b) => a.start.getTime() - b.start.getTime());

        return (
          <div
            key={index}
            className={`border-b border-r border-slate-200 dark:border-slate-700 p-2 flex flex-col gap-1 min-h-[120px] ${isCurrentMonth ? dayCellBg : otherMonthDayCellBg} transition-colors hover:bg-sky-50/80 dark:hover:bg-sky-900/50 cursor-pointer`}
            onClick={() => onDayClick(day)}
          >
            <span className={`self-end text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${today ? 'bg-[var(--primary-600)] text-white' : 'text-slate-600 dark:text-slate-300'}`}>
              {day.getDate()}
            </span>
            <div className="flex-1 overflow-y-auto space-y-1">
                {dailyEvents.map(event => (
                    <div 
                        key={event.id} 
                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                        className="p-1.5 rounded-md text-white text-xs font-medium cursor-pointer flex items-center gap-2 bg-[var(--primary-500)] hover:bg-[var(--primary-600)]"
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
