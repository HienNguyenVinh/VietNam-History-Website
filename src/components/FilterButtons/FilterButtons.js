import React from 'react';
import styles from './FilterButtons.module.css';

const FilterButtons = ({ filter, onFilterChange }) => {
  return (
    <div className={styles.filterButtons}>
      <button onClick={() => onFilterChange('Tất cả')} className={filter === 'Tất cả' ? styles.active : ''}>Tất cả</button>
      <button onClick={() => onFilterChange('phim')} className={filter === 'phim' ? styles.active : ''}>Phim</button>
      <button onClick={() => onFilterChange('video sự kiện')} className={filter === 'video sự kiện' ? styles.active : ''}>Video Sự Kiện</button>
      <button onClick={() => onFilterChange('video nhân vật')} className={filter === 'video nhân vật' ? styles.active : ''}>Video Nhân Vật</button>
    </div>
  );
};

export default FilterButtons;
