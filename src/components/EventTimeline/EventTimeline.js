import React, { useRef, useEffect } from 'react';
import { getFirstTwoSentences } from '../../utils/getFirstTwoSentences';
import styles from './EventTimeline.module.css';

const EventTimeline = ({ events, timelineIndex, selectedEvent, onPrevEvents, onNextEvents, onSelectEvent, onCloseEventDetail, setTimelineIndex }) => {
  const milestonesRef = useRef(null);
  useEffect(() => {
    if (milestonesRef.current) {
      const activeMilestone = milestonesRef.current.children[timelineIndex];
      if (activeMilestone) {
        activeMilestone.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [timelineIndex]);
  return (
    <>
      <div className={styles.timelineContainer}>
        <button
          onClick={onPrevEvents}
          disabled={timelineIndex === 0}
          className={styles.timelineArrow + ' ' + styles.leftArrow}
        >
          ←
        </button>

        <div className={styles.timelineWrapper}>
          {/* 🔹 Milestone progress bar */}
          <div className={styles.timelineProgressBar}>
            <div
              className={styles.timelineProgressFill}
              style={{
                width: `${((timelineIndex + 1) / events.length) * 100}%`,
              }}
            ></div>

            <div className={styles.timelineMilestones} ref={milestonesRef}>
              {events.map((event, index) => (
                <div
                  key={index}
                  className={`${styles.timelineMilestone} ${index === timelineIndex ? styles.active : ""}`}
                  onClick={() => setTimelineIndex(index)}
                >
                  <span className={styles.milestoneLabel}>
                    {event.name.length > 10 ? event.name.slice(0, 10) + "…" : event.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 🔹 Main timeline content */}
          <div className={styles.horizontalTimeline}>
            <div
              className={styles.timelineSlider}
              style={{
                transform: `translateX(-${timelineIndex * 100}%)`,
              }}
            >
              {events.map((event, index) => (
                <div
                  key={index}
                  className={styles.timelineItem}
                  onClick={() => onSelectEvent(event)}
                >
                  <div className={styles.timelineYear}>
                    {`${event.start || "N/A"} - ${event.end || "N/A"}`}
                  </div>
                  <div className={styles.timelineContent}>
                    <h3>{event.name}</h3>
                    <p>{getFirstTwoSentences(event.description)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onNextEvents}
          disabled={timelineIndex >= events.length - 1}
          className={styles.timelineArrow + ' ' + styles.rightArrow}
        >
          →
        </button>
      </div>

      {selectedEvent && (
        <div className={styles.eventDetailModal}>
          <div className={styles.eventDetailContent}>
            <button onClick={onCloseEventDetail} className={styles.closeButton}>×</button>
            <h2>{selectedEvent.name}</h2>
            <p><strong>Năm:</strong> { `${selectedEvent.start} - ${selectedEvent.end}`}</p>
            <p>{selectedEvent.description}</p>
          </div>
        </div>
      )}      
    </>
  );
};

export default EventTimeline;
