import React, { useRef, useEffect } from 'react';
import { getFirst50Words } from '../../utils/getFirst50Words';
import styles from './EventTimeline.module.css';

const EventTimeline = ({ items, mode, timelineIndex, selectedItem, onPrev, onNext, onSelectItem, onCloseDetail, setTimelineIndex, onSwitchToEvents, onBackToCourses, selectedCourseId }) => {
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
      {mode === 'events' && (
        <button onClick={onBackToCourses} className={styles.authSmallButton}>← Quay lại các thời kỳ</button>
      )}
      <div className={styles.timelineContainer}>
        <button
          onClick={onPrev}
          disabled={timelineIndex === 0 || !items || items.length === 0}
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
                width: `${items && items.length > 0 ? ((timelineIndex + 1) / items.length) * 100 : 0}%`,
              }}
            ></div>

            <div className={styles.timelineMilestones} ref={milestonesRef}>
              {items && items.map((item, index) => (
                <div
                  key={index}
                  className={`${styles.timelineMilestone} ${index === timelineIndex ? styles.active : ""}`}
                  onClick={() => setTimelineIndex(index)}
                >
                  <span className={styles.milestoneLabel}>
                    {item && (item.name.length > 10 ? item.name.slice(0, 10) + "…" : item.name)}
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
              {items && items.map((item, index) => (
                <div
                  key={index}
                  className={styles.timelineItem}
                  onClick={() => onSelectItem(item)}
                >
                  <div className={styles.timelineYear}>
                    {mode === 'courses' ? 'Thời kỳ' : `${item && item.start || "N/A"} - ${item && item.end || "N/A"}`}
                  </div>
                  <div className={styles.timelineContent}>
                    <h3>{item && item.name}</h3>
                    <p>{item && item.description ? getFirst50Words(item.description) : 'No description available'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={!items || items.length === 0 || timelineIndex >= items.length - 1}
          className={styles.timelineArrow + ' ' + styles.rightArrow}
        >
          →
        </button>
      </div>

      {selectedItem && (
        <div className={styles.eventDetailModal}>
          <div className={styles.eventDetailContent}>
            <button onClick={onCloseDetail} className={styles.closeButton}>×</button>
            <h2>{selectedItem.name}</h2>
            {mode === 'events' && <p><strong>Năm:</strong> { `${selectedItem.start} - ${selectedItem.end}`}</p>}
            <p>
              {mode === 'events' && selectedItem.image && (
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  style={{
                    float: 'left',
                    marginRight: '10px',
                    width: '200px',
                    height: 'auto',
                    borderRadius: '5px'
                  }}
                />
              )}
              {selectedItem.description}
            </p>
            {mode === 'courses' && (
              <button className={styles.authSmallButton} onClick={() => onSwitchToEvents(selectedItem.id)}>Xem các sự kiện</button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EventTimeline;
