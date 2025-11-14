import React from 'react';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPrevPage, onNextPage }) => {
  return (
    <div className={styles.pagination}>
      <button onClick={onPrevPage} disabled={currentPage === 1}>
        Previous
      </button>
      <span >Page {currentPage} of {totalPages}</span>
      <button onClick={onNextPage} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
