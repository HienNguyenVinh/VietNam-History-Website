import { useState, useEffect } from 'react';
import { useCourses } from './useCourses';

export const useTimeline = () => {
  const coursesHook = useCourses();
  const [mode, setMode] = useState('courses');
  const [items, setItems] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode === 'courses') {
      setItems(coursesHook.courses);
    }
  }, [coursesHook.courses, mode]);

  const onSwitchToEvents = async (courseId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const events = await response.json();
      setItems(events);
      setMode('events');
      setSelectedEvent(null);
      setTimelineIndex(0);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onBackToCourses = () => {
    setMode('courses');
    setItems(coursesHook.courses);
    setSelectedCourseId(null);
    setTimelineIndex(0);
  };

  const onPrevEvents = () => {
    if (timelineIndex > 0) {
      setTimelineIndex(timelineIndex - 1);
    }
  };

  const onNextEvents = () => {
    if (timelineIndex < items.length - 1) {
      setTimelineIndex(timelineIndex + 1);
    }
  };

  const onSelectItem = (item) => {
    setSelectedEvent(item);
  };

  const onCloseDetail = () => {
    setSelectedEvent(null);
  };

  return {
    mode,
    items,
    selectedCourseId,
    timelineIndex,
    selectedEvent,
    loading: loading || coursesHook.loading,
    error: error || coursesHook.error,
    onSwitchToEvents,
    onBackToCourses,
    onPrevEvents,
    onNextEvents,
    onSelectItem,
    onCloseDetail,
    setTimelineIndex,
  };
};
