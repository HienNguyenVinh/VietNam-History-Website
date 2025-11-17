import React, { useState, useEffect } from 'react';
import styles from './YearRangeFilter.module.css';

const YearRangeFilter = ({ startYear, endYear, minYear, maxYear, onStartYearChange, onEndYearChange }) => {
  const [dragging, setDragging] = useState(null);

  const minPercent = ((startYear - minYear) / (maxYear - minYear)) * 100;
  const maxPercent = ((endYear - minYear) / (maxYear - minYear)) * 100;

  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const year = Math.round(minYear + percent * (maxYear - minYear));
    if (Math.abs(year - startYear) < Math.abs(year - endYear)) {
      setDragging('start');
      onStartYearChange(year);
      if (year > endYear) onEndYearChange(year);
    } else {
      setDragging('end');
      onEndYearChange(year);
      if (year < startYear) onStartYearChange(year);
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const year = Math.round(minYear + percent * (maxYear - minYear));
    if (dragging === 'start') {
      onStartYearChange(year);
      if (year > endYear) onEndYearChange(year);
    } else {
      onEndYearChange(year);
      if (year < startYear) onStartYearChange(year);
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setDragging(null);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div><span className={styles.label}>Tìm kiếm theo khoảng thời gian</span>
    <div
      className={styles.sliderContainer}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className={styles.sliderTrack} style={{ background: `linear-gradient(to right, #ddd 0%, #ddd ${minPercent}%, #DA001E ${minPercent}%, #DA001E ${maxPercent}%, #ddd ${maxPercent}%, #ddd 100%)` }}></div>
      <div className={styles.tooltip} style={{ left: `calc(${minPercent}% - 10px)` }}>{startYear}</div>
      <div className={styles.tooltip} style={{ left: `calc(${maxPercent}% - 10px)` }}>{endYear}</div>
      <input
        type="range"
        min={minYear}
        max={maxYear}
        value={startYear}
        className={styles.slider}
        style={{ pointerEvents: 'none' }}
        readOnly
      />
      <input
        type="range"
        min={minYear}
        max={maxYear}
        value={endYear}
        className={styles.slider}
        style={{ pointerEvents: 'none' }}
        readOnly
      />
    </div>
    </div>
  );
};

export default YearRangeFilter;
