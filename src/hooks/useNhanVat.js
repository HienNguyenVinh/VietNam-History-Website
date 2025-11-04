import { useState, useEffect } from 'react';

export const useNhanVat = () => {
  const [nhanVat, setNhanVat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const nhanVatPerPage = 12;

  useEffect(() => {
    fetchNhanVat();
  }, []);

  const fetchNhanVat = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/nhan_vat');
      if (!response.ok) {
        throw new Error('Failed to fetch nhan_vat');
      }
      const data = await response.json();
      setNhanVat(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pagination for nhan_vat
  const indexOfLastNhanVat = currentPage * nhanVatPerPage;
  const indexOfFirstNhanVat = indexOfLastNhanVat - nhanVatPerPage;
  const currentNhanVat = nhanVat.slice(indexOfFirstNhanVat, indexOfLastNhanVat);
  const totalNhanVatPages = Math.ceil(nhanVat.length / nhanVatPerPage);

  const nextPage = () => {
    if (currentPage < totalNhanVatPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    nhanVat: currentNhanVat,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalNhanVatPages,
    nextPage,
    prevPage,
  };
};
