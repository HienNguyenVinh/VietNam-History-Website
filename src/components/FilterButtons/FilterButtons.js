import React from 'react';
import styles from './FilterButtons.module.css';

const FilterButtons = ({ filter, onFilterChange }) => {
  return (
    <div className={styles.filterButtons}>
      <button onClick={() => onFilterChange('All')} className={filter === 'All' ? styles.active : ''}>All</button>
      <button onClick={() => onFilterChange('phim')} className={filter === 'phim' ? styles.active : ''}>Phim</button>
      <button onClick={() => onFilterChange('video sự kiện')} className={filter === 'video sự kiện' ? styles.active : ''}>Video Sự Kiện</button>
      <button onClick={() => onFilterChange('video nhân vật')} className={filter === 'video nhân vật' ? styles.active : ''}>Video Nhân Vật</button>
    </div>
  );
};

export default FilterButtons;
