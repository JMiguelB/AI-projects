import React, { useState, useEffect } from 'react';
import { CalendarEvent, Priority } from '../types';
import { XIcon } from './icons/XIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { resolveConflict } from '../services/geminiService';

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToSave: CalendarEvent;
  conflictingEvent: CalendarEvent;
  onAccept: (resolution: { eventToUpdateId: string; new_start_time: string; new_end_time: string }) => void;
  onIgnore: () => void;
}

const EventInfo: React.FC<{ event: CalendarEvent, isNew?: boolean }> = ({ event, isNew }) => (
    <div className={`p-3 rounded-lg border ${isNew ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700' : 'bg-slate-50 border-slate-200 dark:bg-slate-700/50 dark:border-slate-600'}`}>
        <p className="font-bold text-slate-800 dark:text-slate-100">{event.title} {isNew && <span className="text-sm font-normal text-blue-600 dark:text-blue-400">(New)</span>}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
            {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Priority: {event.priority}</p>
    </div>
);

export const ConflictModal: React.FC<ConflictModalProps> = ({ isOpen, onClose, eventToSave, conflictingEvent, onAccept, onIgnore }) => {
    const [isLoadingAI, setIsLoadingAI] = useState(true);
    const [suggestion, setSuggestion] = useState<{ text: string; resolution: any } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const getSuggestion = async () => {
            setIsLoadingAI(true);
            setError(null);
            try {
                const resolution = await resolveConflict(eventToSave, conflictingEvent);
                const eventToRescheduleId = resolution.eventToUpdateId;
                const eventToReschedule = eventToSave.id === eventToRescheduleId ? eventToSave : conflictingEvent;

                const newStartTime = new Date(resolution.new_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                setSuggestion({
                    text: `Reschedule "${eventToReschedule.title}" to start at ${newStartTime}.`,
                    resolution: resolution,
                });

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown AI error occurred.";
                setError(errorMessage);
            } finally {
                setIsLoadingAI(false);
            }
        };

        getSuggestion();
    }, [isOpen, eventToSave, conflictingEvent]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <AlertTriangleIcon className="w-6 h-6 text-yellow-500" />
                        Schedule Conflict
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <XIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    </button>
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 mb-4">The event you're trying to save overlaps with an existing event.</p>
                
                <div className="space-y-3 mb-4">
                    <EventInfo event={eventToSave} isNew={!eventToSave.id} />
                    <EventInfo event={conflictingEvent} />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-2">
                        <SparklesIcon className="w-5 h-5 text-[var(--primary-500)]" />
                        AI Suggestion
                    </h3>
                    {isLoadingAI && (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500"></div>
                            <span>Analyzing schedule...</span>
                        </div>
                    )}
                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                    {suggestion && <p className="text-sm text-slate-800 dark:text-slate-200">{suggestion.text}</p>}
                </div>

                <div className="flex justify-end items-center mt-6 gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">
                        Cancel
                    </button>
                    <button onClick={onIgnore} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-semibold">
                        Save Anyway
                    </button>
                    <button 
                        onClick={() => suggestion && onAccept(suggestion.resolution)} 
                        disabled={isLoadingAI || !!error}
                        className="px-4 py-2 bg-[var(--primary-600)] text-white rounded-md hover:bg-[var(--primary-700)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Accept Suggestion
                    </button>
                </div>
            </div>
        </div>
    );
};
