import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NhanVatGrid.module.css';
import {getFirstTwoSentences} from '../../utils/getFirstTwoSentences';
const NhanVatGrid = ({ nhanVat }) => {
  return (
    <div className={styles.nhanVatGrid}>
      {nhanVat.map((nv) => (
        <Link key={nv.id} to={`/nhan-vat/${nv.id}`} className={styles.nhanVatItem}>
          <img src={nv.image} alt={nv.name} />
          <h3>{nv.name}</h3>
          <h5>{nv.birth_year} - {nv.death_year}</h5>
          <p>{getFirstTwoSentences(nv.description)}</p>
        </Link>
      ))}
    </div>
  );
};

export default NhanVatGrid;
