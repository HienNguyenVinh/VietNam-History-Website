import React from 'react';
import styles from './YearRangeFilter.module.css';

const YearRangeFilter = ({ startYear, endYear, minYear, maxYear, onStartYearChange, onEndYearChange }) => {
  return (
    <div className={styles.filterContainer}>
      <label className={styles.label}>Filter by Year Range:</label>
      <div className={styles.sliderContainer}>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={startYear}
          onChange={(e) => onStartYearChange(parseInt(e.target.value))}
          className={styles.slider}
        />
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={endYear}
          onChange={(e) => onEndYearChange(parseInt(e.target.value))}
          className={styles.slider}
        />
      </div>
      <div className={styles.values}>
        <span>Start: {startYear}</span>
        <span>End: {endYear}</span>
      </div>
    </div>
  );
};

export default YearRangeFilter;
