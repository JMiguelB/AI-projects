import { useEffect, useRef } from 'react';
import { CalendarEvent, Priority } from '../types';
import { haversineDistance } from '../utils/location';

interface Coords {
  latitude: number;
  longitude: number;
}

const POLLING_INTERVAL = 30 * 1000; // Check every 30 seconds
const ALERT_WINDOW_MINUTES = 10; // Alert if event is within 10 minutes
const MOVEMENT_THRESHOLD_KM = 0.1; // 100 meters

export const useProximityAlerter = (
  events: CalendarEvent[],
  onPotentialLate: (event: CalendarEvent) => void,
  isEnabled: boolean
) => {
  const lastPositionRef = useRef<Coords | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      // Feature is disabled, do nothing.
      return;
    }

    const checkLocationAndEvents = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          const now = new Date();
          const alertThreshold = new Date(now.getTime() + ALERT_WINDOW_MINUTES * 60 * 1000);

          const upcomingHighPriorityEvents = events.filter(event =>
            event.priority === Priority.HIGH &&
            event.contactEmail &&
            !event.autoNotified &&
            event.proximityAlertEnabled && // Check the per-event flag
            event.start > now &&
            event.start <= alertThreshold
          );

          if (upcomingHighPriorityEvents.length === 0) {
            // Update position even if no events, to establish a baseline
            lastPositionRef.current = currentCoords;
            return;
          }

          if (lastPositionRef.current) {
            const distanceMoved = haversineDistance(
              lastPositionRef.current.latitude,
              lastPositionRef.current.longitude,
              currentCoords.latitude,
              currentCoords.longitude
            );
            
            if (distanceMoved < MOVEMENT_THRESHOLD_KM) {
              // User has not moved significantly
              upcomingHighPriorityEvents.forEach(event => {
                onPotentialLate(event);
              });
            }
          }
          
          lastPositionRef.current = currentCoords;
        },
        (error) => {
          // Can't get location, do nothing
          console.warn("Could not get user location for proximity alert:", error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    const intervalId = setInterval(checkLocationAndEvents, POLLING_INTERVAL);
    
    // Initial check
    checkLocationAndEvents();

    // The cleanup function will run when isEnabled changes to false, stopping the interval.
    return () => clearInterval(intervalId);
  }, [events, onPotentialLate, isEnabled]);
};