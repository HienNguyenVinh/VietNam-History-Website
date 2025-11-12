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
        <option value="">All Titles</option>
        {titles.map((title) => (
          <option key={title} value={title}>
            {title.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TitleFilter;
