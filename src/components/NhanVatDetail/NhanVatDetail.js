import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNhanVat } from '../../hooks/useNhanVat';
import styles from './NhanVatDetail.module.css';

const NhanVatDetail = () => {
  const { id } = useParams();
  const { fullNhanVat, loading, error } = useNhanVat();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const selectedNhanVat = fullNhanVat.find(nv => nv.id === String(id));

  if (!selectedNhanVat) return <div>Nhan Vat not found</div>;

  return (
    <div className={styles.nhanVatDetail}>
      <Link to="/nhan-vat" className={styles.backLink}>← Back to Nhan Vat</Link>
      <h1>{selectedNhanVat.name}</h1>
      <h3>{selectedNhanVat.birth_year} - {selectedNhanVat.death_year}</h3>
      <p>{selectedNhanVat.description}</p>
    </div>
  );
};

export default NhanVatDetail;
