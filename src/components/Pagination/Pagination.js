import React from 'react';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPrevPage, onNextPage }) => {
  return (
    <div className={styles.pagination}>
      <button onClick={onPrevPage} disabled={currentPage === 1}>
        Trước
      </button>
      <span >Trang {currentPage} trên {totalPages}</span>
      <button onClick={onNextPage} disabled={currentPage === totalPages}>
        Sau
      </button>
    </div>
  );
};

export default Pagination;
