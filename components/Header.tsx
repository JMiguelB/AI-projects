import React from 'react';
import { MONTHS } from '../constants';
import { CalendarIcon } from './icons/CalendarIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { MenuIcon } from './icons/MenuIcon';

type CalendarView = 'day' | 'month' | 'year';

interface HeaderProps {
  currentDate: Date;
  view: CalendarView;
  calendarName: string;
  onNext: () => void;
  onPrev: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentDate, view, calendarName, onNext, onPrev, onToday, onViewChange, onToggleSidebar }) => {

  const getHeaderText = () => {
    switch (view) {      
      case 'day':
        return currentDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'year':
        return currentDate.getFullYear();
      case 'month':
      default:
        return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  const viewButtonClasses = (buttonView: CalendarView) => 
    `px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-none ${
        view === buttonView 
        ? 'bg-[var(--primary-600)] text-white' 
        : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
    }`;

  return (
    <header className="p-2 sm:p-4 bg-white dark:bg-slate-800 dark:border-b dark:border-slate-700 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 rounded-md hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 lg:hidden"
          aria-label="Toggle menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <CalendarIcon className="h-8 w-8 text-[var(--primary-600)]" />
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">{calendarName}</h1>
      </div>
      <div className="flex items-center gap-1 sm:gap-4">
        <button
          onClick={onToday}
          className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] transition-colors dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"
        >
          Today
        </button>

        <div className="hidden sm:flex items-center border border-slate-300 dark:border-slate-600 rounded-md shadow-sm">
          <button onClick={() => onViewChange('day')} className={`${viewButtonClasses('day')} rounded-l-md`}>Day</button>
          <button onClick={() => onViewChange('month')} className={`${viewButtonClasses('month')} border-l border-r border-slate-300 dark:border-slate-600`}>Month</button>
          <button onClick={() => onViewChange('year')} className={`${viewButtonClasses('year')} rounded-r-md`}>Year</button>
        </div>

        <div className="flex items-center">
          <button onClick={onPrev} className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700">
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <h2 className="w-auto min-w-[10rem] sm:min-w-[15rem] text-center text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300">
            {getHeaderText()}
          </h2>
          <button onClick={onNext} className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700">
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};
