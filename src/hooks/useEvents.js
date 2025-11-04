import { useState, useEffect } from 'react';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const eventsPerView = 1;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextEvents = () => {
    if (timelineIndex + eventsPerView < events.length) {
      setTimelineIndex(timelineIndex + eventsPerView);
    }
  };

  const prevEvents = () => {
    if (timelineIndex > 0) {
      setTimelineIndex(timelineIndex - eventsPerView);
    }
  };

  const selectEvent = (event) => {
    setSelectedEvent(event);
  };

  const closeEventDetail = () => {
    setSelectedEvent(null);
  };

  return {
    events,
    loading,
    error,
    selectedEvent,
    setSelectedEvent,
    timelineIndex,
    setTimelineIndex,
    nextEvents,
    prevEvents,
    selectEvent,
    closeEventDetail,
  };
};
