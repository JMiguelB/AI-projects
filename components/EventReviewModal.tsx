import React, { useState, useEffect, useMemo } from 'react';
import { CalendarEvent } from '../types';
import { XIcon } from './icons/XIcon';
import { EditIcon } from './icons/EditIcon';

// A type for the internal state of the modal
type ReviewableEvent = Omit<CalendarEvent, 'id'> & {
  tempId: string;
  isSelected: boolean;
};

// Helper functions for date/time formatting
const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const formatTime = (date: Date) => date.toTimeString().slice(0, 5);

interface EventReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Omit<CalendarEvent, 'id'>[];
  onConfirm: (confirmedEvents: Omit<CalendarEvent, 'id'>[]) => void;
}

interface EventReviewItemProps {
  event: ReviewableEvent;
  onUpdate: (updatedEvent: ReviewableEvent) => void;
  onToggleSelect: (tempId: string) => void;
}

const EventReviewItem: React.FC<EventReviewItemProps> = ({ event, onUpdate, onToggleSelect }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableEventData, setEditableEventData] = useState({
    title: event.title,
    startDate: formatDate(event.start),
    startTime: formatTime(event.start),
    endDate: formatDate(event.end),
    endTime: formatTime(event.end),
  });

  const handleSave = () => {
    onUpdate({
      ...event,
      title: editableEventData.title,
      start: new Date(`${editableEventData.startDate}T${editableEventData.startTime}`),
      end: new Date(`${editableEventData.endDate}T${editableEventData.endTime}`),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data
    setEditableEventData({
      title: event.title,
      startDate: formatDate(event.start),
      startTime: formatTime(event.start),
      endDate: formatDate(event.end),
      endTime: formatTime(event.end),
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditableEventData(prev => ({...prev, [field]: value}));
  };

  const inputClasses = "w-full p-2 border border-slate-300 rounded-md mt-1 dark:bg-slate-600 dark:border-slate-500 dark:text-white dark:placeholder-slate-400";

  return (
    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Title</label>
            <input type="text" value={editableEventData.title} onChange={e => handleInputChange('title', e.target.value)} className={inputClasses} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Start Date</label>
              <input type="date" value={editableEventData.startDate} onChange={e => handleInputChange('startDate', e.target.value)} className={inputClasses} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Start Time</label>
              <input type="time" value={editableEventData.startTime} onChange={e => handleInputChange('startTime', e.target.value)} className={inputClasses} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">End Date</label>
              <input type="date" value={editableEventData.endDate} onChange={e => handleInputChange('endDate', e.target.value)} className={inputClasses} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">End Time</label>
              <input type="time" value={editableEventData.endTime} onChange={e => handleInputChange('endTime', e.target.value)} className={inputClasses} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={handleCancel} className="px-3 py-1 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold text-sm dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1 bg-[var(--primary-600)] text-white rounded-md hover:bg-[var(--primary-700)] font-semibold text-sm">Save</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={event.isSelected}
            onChange={() => onToggleSelect(event.tempId)}
            className="h-5 w-5 rounded border-slate-300 text-[var(--primary-600)] focus:ring-[var(--primary-500)]"
          />
          <div className="flex-1">
            <p className="font-semibold text-slate-800 dark:text-slate-100">{event.title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {event.start.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <button onClick={() => setIsEditing(true)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600" title="Edit Event">
            <EditIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      )}
    </div>
  );
};


export const EventReviewModal: React.FC<EventReviewModalProps> = ({ isOpen, onClose, events, onConfirm }) => {
  const [reviewableEvents, setReviewableEvents] = useState<ReviewableEvent[]>([]);

  useEffect(() => {
    if (isOpen) {
      setReviewableEvents(
        events.map((event, index) => ({
          ...event,
          tempId: `${Date.now()}-${index}`,
          isSelected: true, // Select all by default
        }))
      );
    }
  }, [isOpen, events]);

  const selectedCount = useMemo(() => reviewableEvents.filter(e => e.isSelected).length, [reviewableEvents]);
  const isAllSelected = selectedCount === reviewableEvents.length && reviewableEvents.length > 0;

  const handleToggleSelectAll = () => {
    const newIsSelected = !isAllSelected;
    setReviewableEvents(prev => prev.map(e => ({ ...e, isSelected: newIsSelected })));
  };

  const handleToggleSelect = (tempId: string) => {
    setReviewableEvents(prev =>
      prev.map(e => (e.tempId === tempId ? { ...e, isSelected: !e.isSelected } : e))
    );
  };
  
  const handleEventUpdate = (updatedEvent: ReviewableEvent) => {
      setReviewableEvents(prev =>
        prev.map(e => (e.tempId === updatedEvent.tempId ? updatedEvent : e))
      );
  };
  
  const handleConfirm = () => {
    const confirmed = reviewableEvents
      .filter(e => e.isSelected)
      .map(({ tempId, isSelected, ...rest }) => rest); // Strip temp properties
      
    onConfirm(confirmed);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl p-6 animate-fade-in-up flex flex-col" style={{maxHeight: '90vh'}}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Review Extracted Events</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <XIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        <div className="border-b border-t border-slate-200 dark:border-slate-700 py-3 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <input
                        id="select-all"
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleToggleSelectAll}
                        className="h-5 w-5 rounded border-slate-300 text-[var(--primary-600)] focus:ring-[var(--primary-500)]"
                    />
                    <label htmlFor="select-all" className="font-semibold text-slate-700 dark:text-slate-200">
                        Select All
                    </label>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {selectedCount} of {reviewableEvents.length} events selected
                </p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {reviewableEvents.map(event => (
                <EventReviewItem
                    key={event.tempId}
                    event={event}
                    onUpdate={handleEventUpdate}
                    onToggleSelect={handleToggleSelect}
                />
            ))}
        </div>

        <div className="flex justify-end items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">
              Cancel
            </button>
            <button 
              onClick={handleConfirm} 
              disabled={selectedCount === 0}
              className="px-4 py-2 bg-[var(--primary-600)] text-white rounded-md hover:bg-[var(--primary-700)] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add {selectedCount} Event{selectedCount !== 1 ? 's' : ''}
            </button>
        </div>
      </div>
    </div>
  );
};
