import React from 'react';
import styles from './NhanVatGrid.module.css';

const NhanVatGrid = ({ nhanVat }) => {
  return (
    <div className={styles.nhanVatGrid}>
      {nhanVat.map((nv) => (
        <div key={nv.id} className={styles.nhanVatItem}>
          <img src={nv.image} alt={nv.name} />
          <h3>{nv.name}</h3>
          <p>{nv.description}</p>
        </div>
      ))}
    </div>
  );
};

export default NhanVatGrid;
