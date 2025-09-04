import React from 'react';
import { MONTHS, WEEKDAYS } from '../constants';
import { CalendarEvent } from '../types';

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

interface MiniCalendarProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  onMonthClick: (month: number) => void;
  onDayClick: (date: Date) => void;
  hasBackgroundImage: boolean;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ year, month, events, onMonthClick, onDayClick, hasBackgroundImage }) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days: (Date | null)[] = [];
  // Add blank spots for the first week
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }
  // Add days of the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  const eventsInMonth = events.filter(e => e.start.getFullYear() === year && e.start.getMonth() === month);
  const bgClass = hasBackgroundImage ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm' : 'bg-white dark:bg-slate-800';

  return (
    <div className={`${bgClass} p-3 rounded-lg shadow hover:shadow-xl transition-shadow`}>
      <h3 
        className="font-semibold text-center text-[var(--primary-600)] mb-2 cursor-pointer hover:underline"
        onClick={() => onMonthClick(month)}
      >
        {MONTHS[month]}
      </h3>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-slate-500 dark:text-slate-400">
        {WEEKDAYS.map(day => <div key={day} className="font-medium">{day.charAt(0)}</div>)}
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`}></div>;
          
          const hasEvent = eventsInMonth.some(e => isSameDay(e.start, day));
          const isToday = isSameDay(new Date(), day);

          return (
            <div 
              key={day.toISOString()} 
              onClick={() => onDayClick(day)}
              className="relative flex items-center justify-center h-6 cursor-pointer"
            >
              <span className={`flex items-center justify-center w-6 h-6 rounded-full ${isToday ? 'bg-[var(--primary-600)] text-white font-bold' : ''} hover:bg-slate-100 dark:hover:bg-slate-700`}>
                {day.getDate()}
              </span>
              {hasEvent && <div className={`absolute bottom-0 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-red-500'}`}></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface YearViewProps {
  year: number;
  events: CalendarEvent[];
  onMonthClick: (month: number) => void;
  onDayClick: (date: Date) => void;
  hasBackgroundImage: boolean;
}

export const YearView: React.FC<YearViewProps> = ({ year, events, onMonthClick, onDayClick, hasBackgroundImage }) => {
  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {MONTHS.map((_, index) => (
        <MiniCalendar 
            key={index} 
            year={year} 
            month={index} 
            events={events}
            onMonthClick={onMonthClick}
            onDayClick={onDayClick}
            hasBackgroundImage={hasBackgroundImage}
        />
      ))}
    </div>
  );
};
