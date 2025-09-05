import { useEffect, useRef } from 'react';
import { CalendarEvent, Priority } from '../types';
import { haversineDistance } from '../utils/location';

interface Coords {
  latitude: number;
  longitude: number;
}

const POLLING_INTERVAL = 30 * 1000; // Check every 30 seconds

export const useProximityAlerter = (
  events: CalendarEvent[],
  onPotentialLate: (event: CalendarEvent) => void,
  isEnabled: boolean,
  alertWindowMinutes: number,
  movementThresholdKm: number
) => {
  const lastPositionRef = useRef<Coords | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const checkSmartAlerts = () => {
      const now = new Date();
      const alertThreshold = new Date(now.getTime() + alertWindowMinutes * 60 * 1000);

      const alertableEvents = events.filter(event =>
        (event.priority === Priority.HIGH || event.priority === Priority.MEDIUM) &&
        !event.autoNotified &&
        event.proximityAlertEnabled &&
        event.start > now &&
        event.start <= alertThreshold
      );

      const proximityEvents = alertableEvents.filter(e => !!e.location);
      const reminderEvents = alertableEvents.filter(e => !e.location);

      // Handle time-based reminders immediately.
      reminderEvents.forEach(event => {
        onPotentialLate(event);
      });

      // Handle location-based proximity alerts.
      if (proximityEvents.length > 0) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const currentCoords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            if (lastPositionRef.current) {
              const distanceMoved = haversineDistance(
                lastPositionRef.current.latitude,
                lastPositionRef.current.longitude,
                currentCoords.latitude,
                currentCoords.longitude
              );
              
              if (distanceMoved < movementThresholdKm) {
                // User has not moved significantly, trigger alerts.
                proximityEvents.forEach(event => {
                  onPotentialLate(event);
                });
              }
            }
            
            // Always update the last known position.
            lastPositionRef.current = currentCoords;
          },
          (error) => {
            console.warn("Could not get user location for proximity alert:", error.message);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    };

    const intervalId = setInterval(checkSmartAlerts, POLLING_INTERVAL);
    checkSmartAlerts(); // Initial check

    return () => clearInterval(intervalId);
  }, [events, onPotentialLate, isEnabled, alertWindowMinutes, movementThresholdKm]);
};