import React, { useState, useEffect } from 'react';
import { CalendarEvent, Priority, RecurrenceFreq } from '../types';
import { XIcon } from './icons/XIcon';
import { MailIcon } from './icons/MailIcon';
import { MessageScenario } from '../services/geminiService';
import { MapPinIcon } from './icons/MapPinIcon';
import { ToggleSwitch } from './ToggleSwitch';
import { MessageSquareIcon } from './icons/MessageSquareIcon';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string, recurringEventId?: string) => void;
  onGenerateMessage: (event: CalendarEvent, scenario: MessageScenario) => void;
  onGenerateSms: (event: CalendarEvent, scenario: MessageScenario) => void;
  onViewDirections: (location: string) => void;
}

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const formatTime = (date: Date) => date.toTimeString().slice(0, 5);

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event, onSave, onDelete, onGenerateMessage, onGenerateSms, onViewDirections }) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState<Priority>(Priority.NONE);
  const [location, setLocation] = useState('');
  const [link, setLink] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [attendees, setAttendees] = useState('');
  const [proximityAlertEnabled, setProximityAlertEnabled] = useState(false);
  const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFreq>('none');
  const [recurrenceUntil, setRecurrenceUntil] = useState('');


  const isNewEvent = !event?.id;

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setStartDate(formatDate(event.start));
      setStartTime(formatTime(event.start));
      setEndDate(formatDate(event.end));
      setEndTime(formatTime(event.end));
      setDescription(event.description || '');
      setCategory(event.category);
      setPriority(event.priority);
      setLocation(event.location || '');
      setLink(event.link || '');
      setContactEmail(event.contactEmail || '');
      setContactPhone(event.contactPhone || '');
      setAttendees(event.attendees?.join(', ') || '');
      setProximityAlertEnabled(event.proximityAlertEnabled ?? false);
      setRecurrenceFreq(event.recurrenceRule?.freq || 'none');
      setRecurrenceUntil(event.recurrenceRule?.until || formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))); // Default 30 days from now
    }
  }, [event]);

  const isHighOrMediumPriority = priority === Priority.HIGH || priority === Priority.MEDIUM;
  const hasLocation = !!location;
  const hasContact = !!contactEmail || !!contactPhone;
  const canShowSmartAlert = isHighOrMediumPriority && (hasLocation || hasContact);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!event) return;
    const attendeesArray = attendees.split(',').map(e => e.trim()).filter(Boolean);
    const updatedEvent: CalendarEvent = {
      ...event,
      title,
      start: new Date(`${startDate}T${startTime}`),
      end: new Date(`${endDate}T${endTime}`),
      description,
      category,
      priority,
      location,
      link,
      contactEmail,
      contactPhone,
      attendees: attendeesArray,
      proximityAlertEnabled,
      recurrenceRule: {
        freq: recurrenceFreq,
        until: recurrenceFreq !== 'none' ? recurrenceUntil : undefined,
      },
    };
    onSave(updatedEvent);
  };
  
  const handleDelete = () => {
      if(event) onDelete(event.id, event.recurringEventId);
  }

  const addGoogleMeet = () => {
    setLink('https://meet.google.com/new');
  };
  
  const addZoom = () => {
    setLink('https://zoom.us/j/5551112222'); // Placeholder
  };
  
  const inputClasses = "w-full p-2 border border-slate-300 rounded-md mt-1 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 dark:focus:ring-offset-slate-800";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{isNewEvent ? 'Create New Event' : 'Event Details'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <XIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClasses} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Start Time</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClasses} />
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClasses} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">End Time</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClasses} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} className={inputClasses} />
            </div>
            <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Priority</label>
                 <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className={inputClasses}>
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Repeats</label>
              <select value={recurrenceFreq} onChange={e => setRecurrenceFreq(e.target.value as RecurrenceFreq)} className={inputClasses}>
                <option value="none">Never</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            {recurrenceFreq !== 'none' && (
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Until</label>
                <input type="date" value={recurrenceUntil} onChange={e => setRecurrenceUntil(e.target.value)} className={inputClasses} />
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${inputClasses} h-24`}></textarea>
          </div>
           <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Location</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} className={`${inputClasses} mt-0 flex-1`} placeholder="e.g., Conference Room 4B" />
              {location && (
                  <button onClick={() => onViewDirections(location)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600" title="Get Directions">
                      <MapPinIcon className="w-5 h-5 text-[var(--primary-600)]"/>
                  </button>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Link</label>
            <div className="flex items-center gap-2 mt-1">
                <input type="url" value={link} onChange={e => setLink(e.target.value)} className={`${inputClasses} mt-0 flex-1`} placeholder="e.g., https://example.com/docs" />
                <button onClick={addGoogleMeet} className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 whitespace-nowrap">Add Meet</button>
                <button onClick={addZoom} className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 whitespace-nowrap">Add Zoom</button>
            </div>
          </div>
           <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Attendees</label>
            <textarea 
                value={attendees} 
                onChange={e => setAttendees(e.target.value)} 
                className={`${inputClasses} h-20`}
                placeholder="Comma-separated emails..."
            ></textarea>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-600 my-4"></div>
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Contact Email</label>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className={inputClasses} placeholder="contact@example.com" />
            </div>
            <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Contact Phone</label>
                <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className={inputClasses} placeholder="(555) 123-4567" />
            </div>
          </div>
           {!isNewEvent && contactEmail && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <MailIcon className="w-5 h-5 text-[var(--primary-600)]" />
                    Notify via Email (AI)
                </h4>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => onGenerateMessage(event, 'late')} className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-900">Running Late</button>
                    <button onClick={() => onGenerateMessage(event, 'cancel')} className="text-xs px-3 py-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900">Cancel Meeting</button>
                    <button onClick={() => onGenerateMessage(event, 'not_going')} className="text-xs px-3 py-1 bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">Can't Make It</button>
                </div>
            </div>
           )}
           {!isNewEvent && contactPhone && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <MessageSquareIcon className="w-5 h-5 text-[var(--primary-600)]" />
                    Notify via SMS (AI)
                </h4>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => onGenerateSms(event, 'late')} className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-900">Running Late</button>
                    <button onClick={() => onGenerateSms(event, 'cancel')} className="text-xs px-3 py-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900">Cancel</button>
                    <button onClick={() => onGenerateSms(event, 'not_going')} className="text-xs px-3 py-1 bg-slate-200 text-slate-800 rounded-full hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">Can't Make It</button>
                </div>
            </div>
           )}
           {canShowSmartAlert && (
            <div className="border-t border-slate-200 dark:border-slate-600 pt-4 mt-4">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Smart Alert</label>
                <div className="flex items-start justify-between gap-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400 max-w-[75%]">
                      {hasLocation ? (
                        <>
                            <p>Get proximity alerts if you're not heading to the event.</p>
                            <p className="text-xs mt-1">A "Notify Contact" option will appear if a contact is added.</p>
                        </>
                      ) : (
                        <p>Get a reminder before the event is due. If a contact is provided, you'll have an option to quickly notify them.</p>
                      )}
                    </div>
                    <ToggleSwitch
                        checked={proximityAlertEnabled}
                        onChange={setProximityAlertEnabled}
                    />
                </div>
            </div>
           )}
        </div>
        <div className="flex justify-between items-center mt-6">
          {!isNewEvent ? (
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">
              Delete
            </button>
          ) : <div />}
          <button onClick={handleSave} className="px-4 py-2 bg-[var(--primary-600)] text-white rounded-md hover:bg-[var(--primary-700)] font-semibold">
            {isNewEvent ? 'Create Event' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};