import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MicIcon } from './icons/MicIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { XIcon } from './icons/XIcon';

interface SidebarProps {
  events: CalendarEvent[];
  onAddEvent: () => void;
  onAddManually: () => void;
  onPrioritize: () => void;
  onPlanStudy: () => void;
  onVoiceCommand: () => void;
  onCritiqueSchedule: () => void;
  onProactiveAssistant: () => void;
  onCustomize: () => void;
  onNlpParse: (command: string) => void;
  isLoadingAI: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  events, onAddEvent, onAddManually, onPrioritize, onPlanStudy, onVoiceCommand, 
  onCritiqueSchedule, onProactiveAssistant, onCustomize, onNlpParse, isLoadingAI, isOpen, onClose 
}) => {
  const [nlpInput, setNlpInput] = useState('');

  const upcomingEvents = events
    .filter(e => e.start > new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  const handleNlpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nlpInput.trim()) {
        onNlpParse(nlpInput.trim());
        setNlpInput('');
    }
  }

  return (
    <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-800 p-4 flex flex-col z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto`}>
      <div className="flex justify-between items-center mb-4 lg:hidden">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Menu</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
          <XIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
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
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Quick Add (AI)</h3>
          <form onSubmit={handleNlpSubmit}>
              <input 
                  type="text"
                  value={nlpInput}
                  onChange={e => setNlpInput(e.target.value)}
                  placeholder="e.g., Meeting tomorrow at 2pm"
                  className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 dark:focus:ring-offset-slate-800 text-sm"
                  disabled={isLoadingAI}
              />
              <button type="submit" disabled={isLoadingAI || !nlpInput.trim()} className="w-full mt-2 px-4 py-2 bg-[var(--primary-500)] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[var(--primary-600)] transition-all disabled:opacity-50">
                  Create Event
              </button>
          </form>
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
          <button onClick={onProactiveAssistant} disabled={isLoadingAI} className="w-full flex items-center gap-3 p-2 text-left text-slate-700 rounded-md hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50">
              <LightbulbIcon className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Proactive Assistant</span>
          </button>
          <button onClick={onVoiceCommand} disabled={isLoadingAI} className="w-full flex items-center gap-3 p-2 text-left text-slate-700 rounded-md hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50">
              <MicIcon className="w-5 h-5 text-red-500" />
              <span className="font-medium">Voice Query</span>
          </button>
        </div>
        
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Upcoming</h3>
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
        
        <div className="mt-auto border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
          <button onClick={onCustomize} className="w-full flex items-center gap-3 p-2 text-left text-slate-700 rounded-md hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">
              <SettingsIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span className="font-medium">Customize</span>
          </button>
          <div className="text-center text-xs text-slate-400 dark:text-slate-500">
              Sync with: Google Calendar, Outlook
          </div>
        </div>
      </div>
    </aside>
  );
};
