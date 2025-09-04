import React from 'react';
import { CalendarEvent } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MicIcon } from './icons/MicIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface SidebarProps {
  events: CalendarEvent[];
  onAddEvent: () => void;
  onAddManually: () => void;
  onPrioritize: () => void;
  onPlanStudy: () => void;
  onVoiceCommand: () => void;
  onCritiqueSchedule: () => void;
  onCustomize: () => void;
  isLoadingAI: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ events, onAddEvent, onAddManually, onPrioritize, onPlanStudy, onVoiceCommand, onCritiqueSchedule, onCustomize, isLoadingAI }) => {
  
  const upcomingEvents = events
    .filter(e => e.start > new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  return (
    <div className="w-72 bg-white dark:bg-slate-800 p-4 flex flex-col gap-6">
      <div className="space-y-2">
        <button onClick={onAddEvent} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary-600)] text-white font-semibold rounded-lg shadow-md hover:bg-[var(--primary-700)] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)]">
          <PlusIcon className="w-5 h-5" />
          Add with AI
        </button>
        <button onClick={onAddManually} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 font-semibold border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600">
          Add Manually
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">AI Tools</h3>
         <button onClick={onPrioritize} disabled={isLoadingAI} className="w-full flex items-center gap-3 p-2 text-left text-slate-700 rounded-md hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50">
            <SparklesIcon className="w-5 h-5 text-purple-500" />
            <span className="font-medium">Prioritize Tasks</span>
        </button>
         <button onClick={onPlanStudy} disabled={isLoadingAI} className="w-full flex items-center gap-3 p-2 text-left text-slate-700 rounded-md hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50">
            <SparklesIcon className="w-5 h-5 text-green-500" />
            <span className="font-medium">Plan Study Time</span>
        </button>
        <button onClick={onCritiqueSchedule} disabled={isLoadingAI} className="w-full flex items-center gap-3 p-2 text-left text-slate-700 rounded-md hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50">
            <CheckCircleIcon className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Analyze Schedule</span>
        </button>
        <button onClick={onVoiceCommand} disabled={isLoadingAI} className="w-full flex items-center gap-3 p-2 text-left text-slate-700 rounded-md hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50">
            <MicIcon className="w-5 h-5 text-red-500" />
            <span className="font-medium">Voice Query</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Upcoming</h3>
        <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                    <div key={event.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{event.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {event.start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            {' at '}
                            {event.start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                        </p>
                    </div>
                ))
            ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming events.</p>
            )}
        </div>
      </div>
      
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
        <button onClick={onCustomize} className="w-full flex items-center gap-3 p-2 text-left text-slate-700 rounded-md hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">
            <SettingsIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <span className="font-medium">Customize</span>
        </button>
        <div className="text-center text-xs text-slate-400 dark:text-slate-500">
            Sync with: Google Calendar, Outlook
        </div>
      </div>
    </div>
  );
};
