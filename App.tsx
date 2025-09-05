import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CalendarEvent, Priority, ThemeMode } from './types';
import { useCalendar } from './hooks/useCalendar';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CalendarView } from './components/CalendarView';
import { DayView } from './components/DayView';
import { YearView } from './components/YearView';
import { EventModal } from './components/EventModal';
import { FileUploadModal } from './components/FileUploadModal';
import { EventReviewModal } from './components/EventReviewModal';
import { SendMessageModal } from './components/SendMessageModal';
import { SendSmsModal } from './components/SendSmsModal';
import { ConflictModal } from './components/ConflictModal';
import { ScheduleAnalysisModal } from './components/ScheduleAnalysisModal';
import { Notification } from './components/Notification';
import { ThemeCustomizer } from './components/ThemeCustomizer';
import { extractEventsFromImage, prioritizeTasks, planStudyTime, processVoiceCommand, generateContactMessage, MessageScenario, critiqueSchedule, parseNaturalLanguageEvent, getProactiveSuggestions } from './services/geminiService';
import { useProximityAlerter } from './hooks/useProximityAlerter';
import { themes, fonts, ThemeColor, FontFamily } from './theme';
import { isOverlapping } from './utils/time';


// Fallback for SpeechRecognition
// FIX: Cast `window` to `any` to avoid TypeScript errors for browser-specific Speech Recognition APIs.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

type CalendarViewType = 'day' | 'month' | 'year';
type NotificationType = { 
    message: string; 
    type: 'success' | 'error' | 'info'; 
    linkUrl?: string;
    linkText?: string;
    actionText?: string;
    onAction?: () => void;
};
type ConflictDataType = {
    eventToSave: CalendarEvent;
    conflictingEvent: CalendarEvent;
};

const App: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [eventsToReview, setEventsToReview] = useState<Omit<CalendarEvent, 'id'>[]>([]);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
  const [isSendSmsModalOpen, setIsSendSmsModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [conflictData, setConflictData] = useState<ConflictDataType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [view, setView] = useState<CalendarViewType>('month');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State for AI message generation
  const [aiMessage, setAiMessage] = useState({ recipient: '', subject: '', body: '' });
  const [aiSms, setAiSms] = useState({ recipient: '', body: '' });
  
  // State for theme and feature settings
  const [calendarName, setCalendarName] = useState('MyPlanner');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [themeColor, setThemeColor] = useState<ThemeColor>('blue');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<FontFamily>('sans');
  const [isProximityAlerterEnabled, setIsProximityAlerterEnabled] = useState(false);
  const [proximityAlertThreshold, setProximityAlertThreshold] = useState(10);
  const [movementThreshold, setMovementThreshold] = useState(0.1);

  const notificationTimeoutIds = useRef<NodeJS.Timeout[]>([]);

  const { 
    currentDate, setCurrentDate, daysInMonth, 
    goToNextMonth, goToPreviousMonth, 
    goToNextDay, goToPreviousDay, 
    goToNextYear, goToPreviousYear,
    goToToday 
  } = useCalendar();

  // Load settings from localStorage on initial render
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('calendarSettings');
      if (savedSettings) {
        const { name, mode, color, bg, font, proximityAlertsEnabled, alertThreshold, moveThreshold } = JSON.parse(savedSettings);
        if (name) setCalendarName(name);
        if (mode) setThemeMode(mode);
        if (color) setThemeColor(color);
        if (bg) setBackgroundImage(bg);
        if (font) setFontFamily(font);
        if (proximityAlertsEnabled) setIsProximityAlerterEnabled(proximityAlertsEnabled);
        if (alertThreshold) setProximityAlertThreshold(alertThreshold);
        if (moveThreshold) setMovementThreshold(moveThreshold);
      }
    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
    }
  }, []);

  // Save theme and feature settings to localStorage and apply theme
  useEffect(() => {
    const settings = JSON.stringify({
      name: calendarName,
      mode: themeMode,
      color: themeColor,
      bg: backgroundImage,
      font: fontFamily,
      proximityAlertsEnabled: isProximityAlerterEnabled,
      alertThreshold: proximityAlertThreshold,
      moveThreshold: movementThreshold,
    });
    localStorage.setItem('calendarSettings', settings);

    // Apply theme styles and dark mode
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
    
    const styleElement = document.getElementById('dynamic-theme-styles') || document.createElement('style');
    styleElement.id = 'dynamic-theme-styles';
    
    const selectedTheme = themes[themeColor];
    const selectedFont = fonts[fontFamily];

    let css = ':root {\n';
    for (const [key, value] of Object.entries(selectedTheme)) {
      css += `  --primary-${key}: ${value};\n`;
    }
    css += `  --font-family: ${selectedFont};\n`;
    css += `  --background-image-url: ${backgroundImage ? `url(${backgroundImage})` : 'none'};\n`;
    css += '}';

    styleElement.innerHTML = css;
    document.head.appendChild(styleElement);
  }, [calendarName, themeMode, themeColor, backgroundImage, fontFamily, isProximityAlerterEnabled, proximityAlertThreshold, movementThreshold]);


  // Load sample events on first render
  useEffect(() => {
    const today = new Date();
    const in15Minutes = new Date(today.getTime() + 15 * 60 * 1000); // For testing proximity alert

    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Team Standup',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
        category: 'Meeting',
        priority: Priority.MEDIUM,
        location: 'Online',
        contactEmail: 'team-lead@example.com',
        attendees: ['dev1@example.com', 'dev2@example.com'],
        autoNotified: false,
        proximityAlertEnabled: true,
      },
      {
        id: '2',
        title: 'Submit Project Proposal',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 17, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 17, 0),
        category: 'Project Deadline',
        priority: Priority.HIGH,
        link: 'https://example.com/proposals',
        contactEmail: 'professor@example.com',
        autoNotified: false,
        proximityAlertEnabled: true,
      },
       {
        id: '3',
        title: 'Lunch with Alex',
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 30),
        category: 'Personal',
        priority: Priority.LOW,
        location: 'The Corner Cafe, 123 Main St',
        contactEmail: 'alex@example.com',
        contactPhone: '555-123-4567'
      },
      {
        id: '4',
        title: 'Client Demo Presentation',
        start: in15Minutes,
        end: new Date(in15Minutes.getTime() + 60 * 60 * 1000),
        category: 'Meeting',
        priority: Priority.HIGH,
        location: 'Client HQ, 456 Business Rd',
        contactEmail: 'client@example.com',
        contactPhone: '555-987-6543',
        autoNotified: false,
        proximityAlertEnabled: true,
      },
    ];
    setEvents(sampleEvents);
  }, []);

  // Native Browser Notifications
  useEffect(() => {
    // FIX: Use window.Notification to avoid conflict with the imported Notification component.
    window.Notification.requestPermission();
    
    // Clear previous timeouts
    notificationTimeoutIds.current.forEach(clearTimeout);
    notificationTimeoutIds.current = [];

    events.forEach(event => {
      const timeUntilEvent = event.start.getTime() - Date.now();
      const notificationTime = timeUntilEvent - 10 * 60 * 1000; // 10 minutes before

      if (notificationTime > 0) {
        const timeoutId = setTimeout(() => {
          // FIX: Use window.Notification to avoid conflict with the imported Notification component.
          if (window.Notification.permission === 'granted') {
            // FIX: Use window.Notification to avoid conflict with the imported Notification component.
            new window.Notification(event.title, {
              body: `Starts at ${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              icon: '/logo.png', // Assuming a logo exists
            });
          }
        }, notificationTime);
        notificationTimeoutIds.current.push(timeoutId);
      }
    });

    return () => {
      notificationTimeoutIds.current.forEach(clearTimeout);
    }
  }, [events]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info', options?: Partial<NotificationType>) => {
    setNotification({ message, type, ...options });
  };
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };
  
  const handleDayClick = (date: Date) => {
      setCurrentDate(date);
      setView('day');
  };
  
  const saveEvent = (eventToSave: CalendarEvent) => {
    const isNew = !eventToSave.id;

    // Handle Recurring Events
    if (eventToSave.recurrenceRule && eventToSave.recurrenceRule.freq !== 'none') {
        const recurringEvents: CalendarEvent[] = [];
        const recurringEventId = eventToSave.recurringEventId || Date.now().toString();
        let currentInstanceDate = new Date(eventToSave.start);
        const endDate = new Date(eventToSave.recurrenceRule.until + 'T23:59:59');
        const duration = eventToSave.end.getTime() - eventToSave.start.getTime();

        while (currentInstanceDate <= endDate) {
            const newEventInstance: CalendarEvent = {
                ...eventToSave,
                id: `${recurringEventId}-${currentInstanceDate.getTime()}`,
                recurringEventId: recurringEventId,
                start: new Date(currentInstanceDate),
                end: new Date(currentInstanceDate.getTime() + duration),
            };
            recurringEvents.push(newEventInstance);

            switch (eventToSave.recurrenceRule.freq) {
                case 'daily': currentInstanceDate.setDate(currentInstanceDate.getDate() + 1); break;
                case 'weekly': currentInstanceDate.setDate(currentInstanceDate.getDate() + 7); break;
                case 'monthly': currentInstanceDate.setMonth(currentInstanceDate.getMonth() + 1); break;
            }
        }
        
        setEvents(prev => [
            ...prev.filter(e => e.recurringEventId !== recurringEventId), // Remove old instances
            ...recurringEvents
        ]);

        showNotification(`Recurring event "${eventToSave.title}" has been saved.`, 'success');

    } else { // Handle Single Event
        if (isNew) {
            const newEventWithId = { ...eventToSave, id: Date.now().toString() };
            setEvents(prev => [...prev, newEventWithId]);
            showNotification('Event created successfully!', 'success');
        } else {
            setEvents(prev => prev.map(e => e.id === eventToSave.id ? eventToSave : e));
            showNotification('Event updated successfully!', 'success');
        }
    }

    setIsEventModalOpen(false);
    setSelectedEvent(null);
}

  const handleSaveEvent = (eventToSave: CalendarEvent) => {
    // Check for conflicts only on non-recurring events for simplicity
    if (eventToSave.recurrenceRule?.freq === 'none' || !eventToSave.recurrenceRule) {
      const conflictingEvent = events.find(
        e => e.id !== eventToSave.id && isOverlapping(e, eventToSave)
      );

      if (conflictingEvent) {
        setConflictData({ eventToSave, conflictingEvent });
        setIsConflictModalOpen(true);
        setIsEventModalOpen(false);
        return;
      }
    }
    saveEvent(eventToSave);
  };
  
  const handleEventUpdate = (eventToUpdate: CalendarEvent) => {
    setEvents(prev => prev.map(e => (e.id === eventToUpdate.id ? eventToUpdate : e)));
    showNotification('Event time updated!', 'success');
  };

  const handleDeleteEvent = (eventId: string, recurringEventId?: string) => {
    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) return;

    if (recurringEventId) {
        if (window.confirm("This is a recurring event. Do you want to delete only this occurrence or all future occurrences? \n\nOK = Delete Future | Cancel = Delete This One")) {
            // Delete all future
            setEvents(prev => prev.filter(e => !(e.recurringEventId === recurringEventId && e.start >= eventToDelete.start)));
            showNotification('All future occurrences deleted.', 'info');
        } else {
            // Delete single
            setEvents(prev => prev.filter(e => e.id !== eventId));
            showNotification('Event deleted.', 'info');
        }
    } else {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        showNotification('Event deleted.', 'info');
    }

    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };
  
  const handleManualAddClick = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0); // Start next hour
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

    setSelectedEvent({
      id: '', // Empty ID signifies a new event
      title: '',
      start,
      end,
      category: 'Personal',
      priority: Priority.NONE,
      description: '',
      location: '',
      link: '',
      contactEmail: '',
      contactPhone: '',
      autoNotified: false,
      proximityAlertEnabled: false,
      recurrenceRule: { freq: 'none' },
    });
    setIsEventModalOpen(true);
  }
  
  const addEvents = (newEvents: Omit<CalendarEvent, 'id'>[]) => {
      const eventsToAdd: CalendarEvent[] = newEvents.map(e => ({
          ...e,
          id: Date.now().toString() + Math.random().toString()
      }));
      setEvents(prev => [...prev, ...eventsToAdd]);
  }

  const handleFileUpload = useCallback(async (fileData: string, mimeType: string) => {
    setIsLoading(true);
    try {
      const extractedData = await extractEventsFromImage(fileData, mimeType);
      const newEvents: Omit<CalendarEvent, 'id'>[] = extractedData.map((item: any) => ({
        title: item.title,
        start: new Date(`${item.start_date}T${item.start_time}`),
        end: new Date(`${item.end_date}T${item.end_time}`),
        description: item.description,
        category: item.category,
        priority: Priority.NONE,
        location: item.location || '',
        link: item.link || '',
        contactEmail: item.contact_email || '',
        contactPhone: item.contact_phone || '',
        attendees: item.attendees || [],
        autoNotified: false,
        proximityAlertEnabled: false,
      }));
      if (newEvents.length > 0) {
        setEventsToReview(newEvents);
        setIsReviewModalOpen(true);
      } else {
        showNotification('No events were found in the document.', 'info');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
      setIsFileUploadModalOpen(false);
    }
  }, []);
  
  const handleConfirmReviewedEvents = (confirmedEvents: Omit<CalendarEvent, 'id'>[]) => {
    if (confirmedEvents.length > 0) {
      addEvents(confirmedEvents);
      showNotification(`Successfully added ${confirmedEvents.length} new event(s)!`, 'success');
    } else {
      showNotification('No events were selected to be added.', 'info');
    }
    setIsReviewModalOpen(false);
    setEventsToReview([]);
  };

  const handlePrioritize = async () => {
      setIsLoading(true);
      try {
          const priorities = await prioritizeTasks(events);
          setEvents(currentEvents => currentEvents.map(e => {
              const newPriority = priorities.find(p => p.id === e.id);
              return newPriority ? {...e, priority: newPriority.priority as Priority} : e;
          }));
          showNotification('Tasks have been prioritized by AI!', 'success');
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
          showNotification(errorMessage, 'error');
      } finally {
          setIsLoading(false);
      }
  }

  const handlePlanStudy = async () => {
    setIsLoading(true);
    try {
        const studyPlanData = await planStudyTime(events);
        const newStudyEvents: Omit<CalendarEvent, 'id'>[] = studyPlanData.map((item: any) => ({
            title: item.title,
            start: new Date(`${item.start_date}T${item.start_time}`),
            end: new Date(`${item.end_date}T${item.end_time}`),
            description: item.description,
            category: item.category,
            priority: Priority.MEDIUM,
            autoNotified: false,
            proximityAlertEnabled: false,
        }));
        if(newStudyEvents.length > 0) {
            addEvents(newStudyEvents);
            showNotification('AI has added study sessions to your calendar!', 'success');
        } else {
            showNotification('No new study sessions were scheduled.', 'info');
        }
    } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
          showNotification(errorMessage, 'error');
    } finally {
          setIsLoading(false);
    }
  }
  
  const handleCritiqueSchedule = async () => {
     setIsLoading(true);
     setAnalysisResult(null);
     setIsAnalysisModalOpen(true);
     try {
       const critique = await critiqueSchedule(events);
       setAnalysisResult(critique);
     } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
       showNotification(errorMessage, 'error');
       setIsAnalysisModalOpen(false); // Close modal on error
     } finally {
       setIsLoading(false);
     }
   };

   const handleProactiveAssistant = async () => {
    setIsLoading(true);
    showNotification('AI is analyzing your schedule for suggestions...', 'info');
    try {
      const suggestions = await getProactiveSuggestions(events);
      if (suggestions.length === 0) {
        showNotification('Your schedule looks great! No immediate suggestions from the AI.', 'success');
        return;
      }

      suggestions.forEach((suggestion: any, index: number) => {
        setTimeout(() => { // Stagger notifications
          if (suggestion.type === 'ADD_BREAK') {
            showNotification(suggestion.suggestionText, 'info', {
              actionText: 'Add 15 min Break',
              onAction: () => {
                const eventToMove = events.find(e => e.id === suggestion.conflictingEventId2);
                if (eventToMove) {
                  const newStart = new Date(eventToMove.start.getTime() + 15 * 60 * 1000);
                  const newEnd = new Date(eventToMove.end.getTime() + 15 * 60 * 1000);
                  handleEventUpdate({ ...eventToMove, start: newStart, end: newEnd });
                  showNotification('Break added!', 'success');
                }
              }
            });
          } else if (suggestion.type === 'BLOCK_WORK_TIME') {
            showNotification(suggestion.suggestionText, 'info', {
              actionText: 'Schedule It',
              onAction: () => {
                const deadlineEvent = events.find(e => e.id === suggestion.deadlineEventId);
                if (deadlineEvent) {
                  const newWorkEvent: CalendarEvent = {
                    id: Date.now().toString() + Math.random().toString(),
                    title: `Work on: ${deadlineEvent.title}`,
                    start: new Date(suggestion.suggested_start_iso),
                    end: new Date(suggestion.suggested_end_iso),
                    category: 'Work Session',
                    priority: Priority.MEDIUM,
                    description: `Dedicated time to prepare for ${deadlineEvent.title}.`,
                    autoNotified: false,
                    proximityAlertEnabled: false,
                    recurrenceRule: { freq: 'none' },
                  };
                  setEvents(prev => [...prev, newWorkEvent]);
                  showNotification('Work session scheduled!', 'success');
                }
              }
            });
          }
        }, index * 1000); // Display notifications one after another
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceCommand = () => {
    if (!SpeechRecognition) {
      showNotification('Voice recognition is not supported in your browser.', 'error');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.start();
    showNotification('Listening...', 'info');

    recognition.onresult = async (event) => {
      const command = event.results[0][0].transcript;
      showNotification(`You said: "${command}". Processing...`, 'info');
      setIsLoading(true);
      try {
        const response = await processVoiceCommand(command, events);
        showNotification(`AI says: ${response}`, 'success');
      } catch (error) {
        showNotification('Sorry, I had trouble with that request.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    recognition.onerror = (event) => {
      showNotification(`Voice recognition error: ${event.error}`, 'error');
    };
  };

  const handleGenerateAiMessage = async (event: CalendarEvent, scenario: MessageScenario) => {
    if (!event.contactEmail) return;
    setIsLoading(true);
    showNotification('AI is drafting a message...', 'info');
    try {
      const messageBody = await generateContactMessage(event, scenario, 'email');
      setAiMessage({
        recipient: event.contactEmail,
        subject: `Regarding: ${event.title}`,
        body: messageBody,
      });
      setIsSendMessageModalOpen(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAiSms = async (event: CalendarEvent, scenario: MessageScenario) => {
    if (!event.contactPhone) return;
    setIsLoading(true);
    showNotification('AI is drafting an SMS...', 'info');
    try {
      const messageBody = await generateContactMessage(event, scenario, 'sms');
      setAiSms({
        recipient: event.contactPhone,
        body: messageBody,
      });
      setIsSendSmsModalOpen(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNlpParse = async (command: string) => {
    setIsLoading(true);
    showNotification("AI is parsing your command...", 'info');
    try {
        const parsedData = await parseNaturalLanguageEvent(command);
        setSelectedEvent({
            id: '', // New event
            title: parsedData.title,
            start: new Date(parsedData.start_iso),
            end: new Date(parsedData.end_iso),
            category: 'Personal',
            priority: Priority.NONE,
            autoNotified: false,
            proximityAlertEnabled: false,
            recurrenceRule: { freq: 'none' },
        });
        setIsEventModalOpen(true);
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showNotification(errorMessage, 'error');
    } finally {
        setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    const { recipient, subject, body } = aiMessage;
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsSendMessageModalOpen(false);
  };

  const handleSendSms = () => {
    const { recipient, body } = aiSms;
    const phoneNumber = recipient.replace(/[^\d+]/g, '');
    window.location.href = `sms:${phoneNumber}?body=${encodeURIComponent(body)}`;
    setIsSendSmsModalOpen(false);
  };

  const handleViewDirections = (location: string) => {
    if (!location) return;
    const encodedLocation = encodeURIComponent(location);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${encodedLocation}`;
                window.open(url, '_blank');
            },
            () => { // Error/denial case
                const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
                window.open(url, '_blank');
                showNotification("Could not get your location. Showing event location only.", "info");
            }
        );
    } else { // Geolocation not supported
        const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
        window.open(url, '_blank');
        showNotification("Geolocation is not supported by your browser.", "error");
    }
  };
  
  // Handlers for Conflict Resolution
  const handleAcceptSuggestion = (resolution: { eventToUpdateId: string; new_start_time: string; new_end_time: string }) => {
    const { eventToUpdateId, new_start_time, new_end_time } = resolution;
    
    // Update the rescheduled event
    const updatedEvents = events.map(e => {
        if (e.id === eventToUpdateId) {
            return { ...e, start: new Date(new_start_time), end: new Date(new_end_time) };
        }
        return e;
    });

    setEvents(updatedEvents);

    // Save the original event that triggered the conflict
    if (conflictData) {
        saveEvent(conflictData.eventToSave);
    }
    
    showNotification('Schedule updated successfully!', 'success');
    setIsConflictModalOpen(false);
    setConflictData(null);
  };
  
  const handleIgnoreConflict = () => {
    if (conflictData) {
        saveEvent(conflictData.eventToSave);
        showNotification('Overlapping event was saved.', 'info');
    }
    setIsConflictModalOpen(false);
    setConflictData(null);
  };

  const handleCancelConflict = () => {
    setIsConflictModalOpen(false);
    setConflictData(null);
    setSelectedEvent(null);
  }

  const handleNext = () => {
    if (view === 'day') goToNextDay();
    else if (view === 'month') goToNextMonth();
    else if (view === 'year') goToNextYear();
  };

  const handlePrev = () => {
    if (view === 'day') goToPreviousDay();
    else if (view === 'month') goToPreviousMonth();
    else if (view === 'year') goToPreviousYear();
  };
  
  const handleSmartAlert = useCallback((event: CalendarEvent) => {
    setEvents(prevEvents =>
      prevEvents.map(e => (e.id === event.id ? { ...e, autoNotified: true } : e))
    );

    const isProximityType = !!event.location;
    const message = isProximityType
      ? `Are you running late for "${event.title}"?`
      : `Reminder: "${event.title}" is due soon.`;

    const options: Partial<NotificationType> = {};
    if (event.contactEmail || event.contactPhone) {
        options.actionText = 'Notify Contact';
        options.onAction = () => {
            // The geminiService will adapt the message content based on location.
            // Prefer email if both are available.
            if (event.contactEmail) {
                handleGenerateAiMessage(event, 'late');
            } else if (event.contactPhone) {
                handleGenerateAiSms(event, 'late');
            }
        };
    }

    showNotification(message, 'info', options);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useProximityAlerter(events, handleSmartAlert, isProximityAlerterEnabled, proximityAlertThreshold, movementThreshold);

  const renderCalendarView = () => {
      switch (view) {
          case 'day':
              return <DayView 
                date={currentDate} 
                events={events} 
                onEventClick={handleEventClick} 
                onViewDirections={handleViewDirections}
                hasBackgroundImage={!!backgroundImage}
              />;
          case 'year':
              return <YearView 
                year={currentDate.getFullYear()}
                events={events}
                onMonthClick={(month) => {
                    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
                    setView('month');
                }}
                onDayClick={handleDayClick}
                hasBackgroundImage={!!backgroundImage}
              />;
          case 'month':
          default:
              return <CalendarView
                days={daysInMonth}
                currentMonth={currentDate.getMonth()}
                events={events}
                onEventClick={handleEventClick}
                onDayClick={handleDayClick}
                onEventUpdate={handleEventUpdate}
                hasBackgroundImage={!!backgroundImage}
              />;
      }
  }

  return (
    <div className="h-screen w-screen flex flex-col dark:bg-slate-900 dark:text-slate-100" style={{fontFamily: `var(--font-family)`}}>
      <Header
        currentDate={currentDate}
        view={view}
        calendarName={calendarName}
        onNext={handleNext}
        onPrev={handlePrev}
        onToday={goToToday}
        onViewChange={setView}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        {isSidebarOpen && (
            <div
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                aria-hidden="true"
            ></div>
        )}
        <Sidebar 
            events={events}
            onAddEvent={() => setIsFileUploadModalOpen(true)}
            onAddManually={handleManualAddClick}
            onPrioritize={handlePrioritize}
            onPlanStudy={handlePlanStudy}
            onCritiqueSchedule={handleCritiqueSchedule}
            onProactiveAssistant={handleProactiveAssistant}
            onVoiceCommand={handleVoiceCommand}
            onNlpParse={handleNlpParse}
            onCustomize={() => setIsThemeModalOpen(true)}
            isLoadingAI={isLoading}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />
        <main 
          className="flex-1 p-2 sm:p-4 bg-slate-100 dark:bg-slate-900 flex overflow-auto bg-cover bg-center"
          style={{ backgroundImage: 'var(--background-image-url)' }}
        >
            {renderCalendarView()}
        </main>
      </div>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => { setIsEventModalOpen(false); setSelectedEvent(null); }}
        event={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        onGenerateMessage={handleGenerateAiMessage}
        onGenerateSms={handleGenerateAiSms}
        onViewDirections={handleViewDirections}
      />
      
      <FileUploadModal 
        isOpen={isFileUploadModalOpen}
        onClose={() => setIsFileUploadModalOpen(false)}
        onFileUpload={handleFileUpload}
        isLoading={isLoading}
      />

      <EventReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        events={eventsToReview}
        onConfirm={handleConfirmReviewedEvents}
      />

      <SendMessageModal
        isOpen={isSendMessageModalOpen}
        onClose={() => setIsSendMessageModalOpen(false)}
        recipient={aiMessage.recipient}
        subject={aiMessage.subject}
        body={aiMessage.body}
        onBodyChange={(newBody) => setAiMessage(prev => ({ ...prev, body: newBody }))}
        onSend={handleSendMessage}
      />

      <SendSmsModal
        isOpen={isSendSmsModalOpen}
        onClose={() => setIsSendSmsModalOpen(false)}
        recipient={aiSms.recipient}
        body={aiSms.body}
        onBodyChange={(newBody) => setAiSms(prev => ({ ...prev, body: newBody }))}
        onSend={handleSendSms}
      />

      {conflictData && (
        <ConflictModal
          isOpen={isConflictModalOpen}
          onClose={handleCancelConflict}
          eventToSave={conflictData.eventToSave}
          conflictingEvent={conflictData.conflictingEvent}
          onAccept={handleAcceptSuggestion}
          onIgnore={handleIgnoreConflict}
        />
      )}

      <ScheduleAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        analysisResult={analysisResult}
        isLoading={isLoading}
      />
      
      <ThemeCustomizer 
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        calendarName={calendarName}
        onCalendarNameChange={setCalendarName}
        themeMode={themeMode}
        onThemeModeChange={setThemeMode}
        currentColor={themeColor}
        onColorChange={setThemeColor}
        currentFont={fontFamily}
        onFontChange={setFontFamily}
        onBgChange={setBackgroundImage}
        isProximityAlertsEnabled={isProximityAlerterEnabled}
        onProximityAlertsChange={setIsProximityAlerterEnabled}
        proximityAlertThreshold={proximityAlertThreshold}
        onProximityAlertThresholdChange={setProximityAlertThreshold}
        movementThreshold={movementThreshold}
        onMovementThresholdChange={setMovementThreshold}
      />
      
      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
          linkUrl={notification.linkUrl}
          linkText={notification.linkText}
          actionText={notification.actionText}
          onAction={notification.onAction}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default App;
