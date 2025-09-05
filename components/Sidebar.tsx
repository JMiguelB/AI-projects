import React, { useState } from 'react';
import { CalendarEvent, Task, Priority } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MicIcon } from './icons/MicIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { XIcon } from './icons/XIcon';
import { ShareIcon } from './icons/ShareIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';


interface SidebarProps {
  events: CalendarEvent[];
  tasks: Task[];
  onAddTask: (title: string, priority: Priority) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddEvent: () => void;
  onAddManually: () => void;
  onPrioritize: () => void;
  onPlanStudy: () => void;
  onVoiceCommand: () => void;
  onCritiqueSchedule: () => void;
  onProactiveAssistant: () => void;
  onShare: () => void;
  onCustomize: () => void;
  onNlpParse: (command: string) => void;
  isLoadingAI: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  events, tasks, onAddTask, onToggleTask, onDeleteTask, onAddEvent, onAddManually, onPrioritize, onPlanStudy, onVoiceCommand, 
  onCritiqueSchedule, onProactiveAssistant, onShare, onCustomize, onNlpParse, isLoadingAI, isOpen, onClose 
}) => {
  const [nlpInput, setNlpInput] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>(Priority.MEDIUM);
  const [showCompleted, setShowCompleted] = useState(false);

  const upcomingEvents = events
    .filter(e => e.start > new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);
  
  const activeTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  const handleNlpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nlpInput.trim()) {
        onNlpParse(nlpInput.trim());
        setNlpInput('');
    }
  }
  
  const handleTaskSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (taskInput.trim()) {
          onAddTask(taskInput.trim(), taskPriority);
          setTaskInput('');
          setTaskPriority(Priority.MEDIUM);
      }
  };
  
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
      e.dataTransfer.setData('text/plain', `task-${taskId}`);
  };

  return (
    <aside className={`fixed inset-y-0 left-0 w-80 bg-white dark:bg-slate-800 p-4 flex flex-col z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto`}>
      <div className="flex justify-between items-center mb-4 lg:hidden">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Menu</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
          <XIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1">
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
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase">Tasks</h3>
            <form onSubmit={handleTaskSubmit} className="space-y-2">
                <input
                    type="text"
                    value={taskInput}
                    onChange={e => setTaskInput(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 dark:focus:ring-offset-slate-800 text-sm"
                />
                <div className="flex items-center gap-2">
                    <select value={taskPriority} onChange={e => setTaskPriority(e.target.value as Priority)} className="flex-1 p-2 border border-slate-300 rounded-md text-sm dark:bg-slate-700 dark:border-slate-600">
                        <option value={Priority.HIGH}>High</option>
                        <option value={Priority.MEDIUM}>Medium</option>
                        <option value={Priority.LOW}>Low</option>
                    </select>
                    <button type="submit" className="px-4 py-2 bg-[var(--primary-500)] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[var(--primary-600)] transition-all">Add</button>
                </div>
            </form>
            <div className="space-y-2">
                {activeTasks.map(task => (
                    <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md cursor-grab active:cursor-grabbing group">
                        <input type="checkbox" checked={false} onChange={() => onToggleTask(task.id)} className="h-4 w-4 rounded border-slate-300 text-[var(--primary-600)] focus:ring-[var(--primary-500)]" />
                        <span className="flex-1 text-sm text-slate-800 dark:text-slate-200">{task.title}</span>
                        <button onClick={() => onDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrashIcon className="w-4 h-4 text-slate-500 hover:text-red-500"/>
                        </button>
                    </div>
                ))}
            </div>
            {completedTasks.length > 0 && (
                <div>
                    <button onClick={() => setShowCompleted(!showCompleted)} className="w-full flex justify-between items-center text-left text-xs font-semibold text-slate-500 dark:text-slate-400 py-1">
                        <span>Completed ({completedTasks.length})</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
                    </button>
                    {showCompleted && (
                        <div className="space-y-2 mt-2">
                            {completedTasks.map(task => (
                                <div key={task.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md group">
                                    <input type="checkbox" checked={true} onChange={() => onToggleTask(task.id)} className="h-4 w-4 rounded border-slate-300 text-[var(--primary-600)] focus:ring-[var(--primary-500)]" />
                                    <span className="flex-1 text-sm text-slate-500 dark:text-slate-400 line-through">{task.title}</span>
                                    <button onClick={() => onDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrashIcon className="w-4 h-4 text-slate-500 hover:text-red-500"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
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
                <p className="text-sm text-slate-500 dark:text-slate-400">Your schedule is clear.</p>
            )}
        </div>
        
        <div className="mt-auto border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
          <button onClick={onShare} className="w-full flex items-center gap-3 p-2 text-left text-slate-700 rounded-md hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">
              <ShareIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span className="font-medium">Share</span>
          </button>
          <button onClick={onCustomize} className="w-full flex items-center gap-3 p-2 text-left text-slate-700 rounded-md hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700">
              <SettingsIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span className="font-medium">Customize</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
