import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent, Priority } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "NO_API_KEY" });

const eventSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The title of the event or task." },
            start_date: { type: Type.STRING, description: "The start date in YYYY-MM-DD format." },
            start_time: { type: Type.STRING, description: "The start time in HH:MM (24-hour) format." },
            end_date: { type: Type.STRING, description: "The end date in YYYY-MM-DD format. Same as start_date if not specified." },
            end_time: { type: Type.STRING, description: "The end time in HH:MM (24-hour) format. If it's a deadline, this is the due time." },
            description: { type: Type.STRING, description: "A brief description of the event." },
            category: { type: Type.STRING, description: "A category like 'Meeting', 'Exam', 'Homework', 'Project Deadline', 'Personal'." },
            location: { type: Type.STRING, description: "The physical location, address, or room for the event, if mentioned." },
            link: { type: Type.STRING, description: "A URL or web link associated with the event, if mentioned." },
            contact_email: { type: Type.STRING, description: "A contact email address associated with the event, if mentioned." },
            contact_phone: { type: Type.STRING, description: "A contact phone number associated with the event, if mentioned." },
            attendees: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of attendee email addresses, if mentioned." },
        },
        required: ["title", "start_date", "start_time", "end_date", "end_time", "category"]
    }
};

const naturalLanguageEventSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "The title of the event." },
        start_iso: { type: Type.STRING, description: "The calculated start date and time in full ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)." },
        end_iso: { type: Type.STRING, description: "The calculated end date and time in full ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ). If no duration is mentioned, default to a 1-hour duration." },
    },
    required: ["title", "start_iso", "end_iso"]
};

const prioritySchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "The unique ID of the event." },
            priority: { type: Type.STRING, description: "The assigned priority: 'High', 'Medium', or 'Low'." }
        },
        required: ["id", "priority"]
    }
}

const conflictResolutionSchema = {
  type: Type.OBJECT,
  properties: {
    eventToUpdateId: { type: Type.STRING, description: "The ID of the event that should be rescheduled." },
    new_start_time: { type: Type.STRING, description: "The suggested new start time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)." },
    new_end_time: { type: Type.STRING, description: "The suggested new end time in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)." }
  },
  required: ["eventToUpdateId", "new_start_time", "new_end_time"]
};

const proactiveSuggestionsSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, description: "The type of suggestion, either 'ADD_BREAK' or 'BLOCK_WORK_TIME'." },
      suggestionText: { type: Type.STRING, description: "The user-facing text for the suggestion." },
      conflictingEventId1: { type: Type.STRING, description: "(For ADD_BREAK) The ID of the first event in the back-to-back sequence." },
      conflictingEventId2: { type: Type.STRING, description: "(For ADD_BREAK) The ID of the second event, which will be moved." },
      deadlineEventId: { type: Type.STRING, description: "(For BLOCK_WORK_TIME) The ID of the deadline event." },
      suggested_start_iso: { type: Type.STRING, description: "(For BLOCK_WORK_TIME) The suggested start time for the new work block in ISO 8601 format." },
      suggested_end_iso: { type: Type.STRING, description: "(For BLOCK_WORK_TIME) The suggested end time for the new work block in ISO 8601 format." },
    },
    required: ["type", "suggestionText"]
  }
};


export const extractEventsFromImage = async (base64Image: string, mimeType: string): Promise<any[]> => {
    if (process.env.API_KEY === "NO_API_KEY") return [];
    try {
        const currentDate = new Date().toISOString().split('T')[0];
        const prompt = `You are an expert calendar assistant. Extract all events, tasks, and deadlines from this document or image. For each item, provide the details requested in the JSON schema, including locations, web links, contact emails, phone numbers, and a list of any attendees. Dates should be in YYYY-MM-DD format and times in HH:MM (24-hour) format. Today's date is ${currentDate}. If a day of the week is mentioned (e.g., 'next Tuesday'), calculate the correct date based on today. Infer end times if not specified (e.g., a meeting might be 1 hour). For deadlines, start and end time can be the same. Respond ONLY with a valid JSON object matching the provided schema.`;

        const imagePart = { inlineData: { data: base64Image, mimeType } };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: eventSchema,
            },
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error extracting events from image:", error);
        throw new Error("Failed to analyze the document. The AI could not extract event information.");
    }
};

export const parseNaturalLanguageEvent = async (command: string): Promise<any> => {
    if (process.env.API_KEY === "NO_API_KEY") {
        throw new Error("AI features are disabled.");
    }
    try {
        const prompt = `You are an intelligent calendar assistant. Parse the following user command to create a calendar event.
- Today's date is ${new Date().toISOString()}.
- Calculate the correct date and time based on relative terms like "tomorrow", "next Friday", etc.
- If no duration is specified, assume a 1-hour duration for the event.
- Respond ONLY with a valid JSON object that strictly follows the provided schema.

User command: "${command}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: naturalLanguageEventSchema
            }
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error parsing natural language event:", error);
        throw new Error("The AI failed to understand the event details.");
    }
};


export const prioritizeTasks = async (events: CalendarEvent[]): Promise<{id: string, priority: Priority}[]> => {
    if (process.env.API_KEY === "NO_API_KEY" || events.length === 0) return [];
    try {
        const simplifiedEvents = events.map(e => ({
            id: e.id,
            title: e.title,
            deadline: e.end.toISOString()
        }));

        const prompt = `Analyze this list of tasks and assign a priority level ('High', 'Medium', 'Low') to each, based on keywords like 'exam', 'final', 'urgent', 'report', 'presentation' and how soon its deadline is. Today is ${new Date().toISOString()}. Respond ONLY with a valid JSON array matching the schema.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${prompt}\n\nTasks:\n${JSON.stringify(simplifiedEvents)}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: prioritySchema
            }
        });
        
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error prioritizing tasks:", error);
        throw new Error("Failed to prioritize tasks. The AI could not complete the request.");
    }
};

export const planStudyTime = async (events: CalendarEvent[]): Promise<any[]> => {
    if (process.env.API_KEY === "NO_API_KEY" || events.length === 0) return [];
    try {
        const existingSchedule = events.map(e => ({
            title: e.title,
            start: e.start.toISOString(),
            end: e.end.toISOString()
        }));
        
        const deadlines = events.filter(e => ['Exam', 'Project Deadline', 'Homework'].includes(e.category));

        if (deadlines.length === 0) {
            throw new Error("No exams or deadlines found to plan study time for.");
        }

        const prompt = `Based on the user's existing calendar schedule and upcoming deadlines, generate a study plan. Create 1 or 2-hour 'Study Session' blocks for each major deadline (like exams or projects). Find free slots between 9 AM and 8 PM on the days leading up to the deadline, avoiding conflicts with existing events. Add a description indicating what the study session is for. For example, 'Study for [Exam Title]'. Respond ONLY with a valid JSON array of new calendar event objects to add, following the provided schema.

Current Schedule: ${JSON.stringify(existingSchedule)}
Deadlines to plan for: ${JSON.stringify(deadlines.map(d => ({title: d.title, due: d.end.toISOString()})))}
Today is: ${new Date().toISOString()}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: eventSchema
            }
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error planning study time:", error);
        throw new Error("Failed to generate a study plan. The AI could not complete the request.");
    }
};

export const processVoiceCommand = async (command: string, events: CalendarEvent[]): Promise<string> => {
    if (process.env.API_KEY === "NO_API_KEY") return "Voice commands are disabled.";
    try {
        const prompt = `You are a helpful calendar assistant. The user said: "${command}". 
        Answer their question based on the provided list of events. Be concise and conversational. 
        If they ask about their schedule, find the relevant events and summarize them.
        For example, if they ask "What's my next exam?", find the event with category 'Exam' that is closest in the future and state its name and date.
        If they ask "Show me all deadlines this week", list the events that are due within the next 7 days.
        Today is ${new Date().toLocaleDateString()}.
        
        Events:
        ${JSON.stringify(events.map(e => ({title: e.title, start: e.start.toLocaleString(), end: e.end.toLocaleString(), category: e.category})))}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text;
    } catch (error) {
        console.error("Error processing voice command:", error);
        return "Sorry, I couldn't understand that.";
    }
}

export type MessageScenario = 'late' | 'cancel' | 'not_going';
export type MessageFormat = 'email' | 'sms';

export const generateContactMessage = async (
  event: CalendarEvent, 
  scenario: MessageScenario, 
  format: MessageFormat
): Promise<string> => {
  if (process.env.API_KEY === "NO_API_KEY") return "AI features are disabled.";
  
  let scenarioPrompt = '';
  switch (scenario) {
    case 'late':
      if (event.location) {
        scenarioPrompt = `I am running a few minutes late for our "${event.title}" meeting scheduled for ${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. I apologize for the delay and will be there as soon as possible.`;
      } else {
        scenarioPrompt = `I am writing regarding the deadline for "${event.title}". I might need a little more time and will submit it as soon as possible. I apologize for any inconvenience.`;
      }
      break;
    case 'cancel':
      scenarioPrompt = `I unfortunately need to cancel our "${event.title}" meeting scheduled for ${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} today. Something unexpected has come up. I'd like to reschedule for a later date.`;
      break;
    case 'not_going':
      scenarioPrompt = `I regret to inform you that I will be unable to attend the "${event.title}" event scheduled for ${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. I apologize for any inconvenience this may cause.`;
      break;
  }

  const prompt = `You are a professional assistant. Based on the following situation, write a concise and polite ${format === 'email' ? 'email body' : 'SMS message'}.
${format === 'sms' ? 'The SMS message MUST be under 160 characters. Do not add any greeting or sign-off.' : 'Do not include a subject line or "Hi [Name]". Just write the main message body.'}

Situation: ${scenarioPrompt}
Event Details: ${event.title} on ${event.start.toLocaleDateString()}.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating contact message:", error);
    throw new Error("The AI failed to generate the message.");
  }
};

export const resolveConflict = async (event1: CalendarEvent, event2: CalendarEvent): Promise<any> => {
    if (process.env.API_KEY === "NO_API_KEY") {
        throw new Error("AI features are disabled.");
    }

    // Determine which event is more important. Give High priority more weight.
    const priorityOrder = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1, [Priority.NONE]: 0 };
    const event1Score = priorityOrder[event1.priority];
    const event2Score = priorityOrder[event2.priority];

    const moreImportantEvent = event1Score >= event2Score ? event1 : event2;
    const lessImportantEvent = event1Score < event2Score ? event1 : event2;

    const prompt = `You are an intelligent scheduling assistant. Two events are conflicting. 
    Event A (the more important one): "${moreImportantEvent.title}" from ${moreImportantEvent.start.toISOString()} to ${moreImportantEvent.end.toISOString()}. Priority: ${moreImportantEvent.priority}.
    Event B (the less important one): "${lessImportantEvent.title}" from ${lessImportantEvent.start.toISOString()} to ${lessImportantEvent.end.toISOString()}. Priority: ${lessImportantEvent.priority}.

    Your task is to reschedule Event B. Find the next available time slot for Event B immediately after Event A concludes. The duration of Event B should remain the same. 
    Respond ONLY with a valid JSON object matching the provided schema, containing the ID of Event B and its new suggested start and end times.
    
    Event B ID to use in response: ${lessImportantEvent.id}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: conflictResolutionSchema,
            }
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error resolving conflict:", error);
        throw new Error("The AI failed to suggest a resolution for the conflict.");
    }
};

export const critiqueSchedule = async (events: CalendarEvent[]): Promise<string> => {
    if (process.env.API_KEY === "NO_API_KEY" || events.length === 0) {
        return "No events to analyze.";
    }

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingEvents = events
        .filter(e => e.start > today && e.start <= nextWeek)
        .map(e => ({
            title: e.title,
            start: e.start.toISOString(),
            end: e.end.toISOString(),
            priority: e.priority,
            category: e.category
        }));

    if (upcomingEvents.length === 0) {
        return "Your schedule for the next 7 days is clear! Looks like a great time to relax or plan ahead.";
    }

    const prompt = `You are a world-class productivity coach. Analyze the user's schedule for the next 7 days and provide a concise, helpful critique. Look for potential issues like:
- **Overscheduling**: Too many back-to-back events without breaks.
- **Cramming**: Lack of preparation time before major deadlines or exams.
- **Poor Balance**: Not enough personal or down time scheduled.

Provide actionable suggestions. For example, "You have 3 meetings in a row on Tuesday, consider adding a 15-minute break." or "Your project is due Friday, but you have no time blocked to work on it. I suggest adding a study session on Thursday."

Be encouraging and friendly. Start with a general impression (e.g., "Overall, your week looks manageable," or "Your week looks quite busy."). Format your response with markdown for readability (e.g., use bullet points for suggestions).

User's Schedule:
${JSON.stringify(upcomingEvents)}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error critiquing schedule:", error);
        throw new Error("The AI failed to analyze your schedule.");
    }
};

export const getProactiveSuggestions = async (events: CalendarEvent[]): Promise<any[]> => {
    if (process.env.API_KEY === "NO_API_KEY" || events.length < 2) {
        return [];
    }
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingEvents = events
        .filter(e => e.start > today && e.start <= nextWeek)
        .map(e => ({
            id: e.id,
            title: e.title,
            start: e.start.toISOString(),
            end: e.end.toISOString(),
            priority: e.priority,
            category: e.category
        }));

    if (upcomingEvents.length < 2) {
        return [];
    }

    const prompt = `You are a world-class productivity coach. Analyze the user's schedule for the next 7 days to find opportunities for improvement. Today is ${new Date().toISOString()}.
Your goal is to identify two specific types of issues and provide actionable JSON solutions:
1.  **Back-to-Back Burnout**: Find events that are scheduled immediately after one another (end time of first event equals start time of second event) without any break. Suggest adding a 15-minute break by pushing the second event forward. Identify the events by their IDs.
2.  **Deadline Cramming**: Find events that are high-priority AND have a category of 'Exam', 'Project Deadline', 'Homework', or 'Test', OR have titles containing keywords like 'exam', 'test', 'final report', or 'presentation'. For these critical events, check if there is a corresponding 'Study Session' or 'Work Session' event scheduled in the 3 days prior. If not, suggest creating a new 2-hour work block on a free day before the deadline, ideally between 9 AM and 5 PM local time.

Analyze the provided schedule and respond ONLY with a valid JSON array of suggestions matching the provided schema. If there are no suggestions, return an empty array.

User's Schedule:
${JSON.stringify(upcomingEvents)}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: proactiveSuggestionsSchema,
            }
        });
        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error getting proactive suggestions:", error);
        throw new Error("The AI failed to generate proactive suggestions.");
    }
};