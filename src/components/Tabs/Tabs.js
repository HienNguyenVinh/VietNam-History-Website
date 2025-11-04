import React from 'react';
import styles from './Tabs.module.css';

const Tabs = ({ activeTab, onTabChange }) => {
  return (
    <div className={styles.tabs}>
      <button onClick={() => onTabChange('trang-chu')} className={activeTab === 'trang-chu' ? styles.active : ''}>Trang Chủ</button>
      <button onClick={() => onTabChange('nhan-vat')} className={activeTab === 'nhan-vat' ? styles.active : ''}>Nhân Vật</button>
      <button onClick={() => onTabChange('video')} className={activeTab === 'video' ? styles.active : ''}>Video</button>
    </div>
  );
};

export default Tabs;
