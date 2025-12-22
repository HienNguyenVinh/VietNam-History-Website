import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NhanVatGrid.module.css';
import {getFirst50Words} from '../../utils/getFirst50Words';
const NhanVatGrid = ({ nhanVat }) => {
  return (
    <div className={styles.nhanVatGrid}>
      {nhanVat.map((nv) => (
        <Link key={nv.id} to={`/nhan-vat/${nv.id}`} className={styles.nhanVatItem}>
          <h3>{nv.name}</h3>
          <h5>{nv.birth_year} - {nv.death_year}</h5>
          <p>{getFirst50Words(nv.description)}</p>
        </Link>
      ))}
    </div>
  );
};

export default NhanVatGrid;
