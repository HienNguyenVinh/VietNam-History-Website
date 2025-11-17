import React from 'react';
import styles from './TitleFilter.module.css';

const TitleFilter = ({ selectedTitle, onTitleChange, titles }) => {
  return (
    <div className={styles.titleFilterContainer}>
      <select
        value={selectedTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        className={styles.titleSelect}
      >
        <option value="">Tất cả</option>
        {titles.map((title) => (
          <option key={title} value={title}>
            {title.replaceAll('_', ' ')}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TitleFilter;
