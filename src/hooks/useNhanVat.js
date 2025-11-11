import { useState, useEffect } from 'react';

export const useNhanVat = () => {
  const [nhanVat, setNhanVat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [startYear, setStartYear] = useState(0);
  const [endYear, setEndYear] = useState(2023);
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

  // Filter nhan_vat based on search term and year range
  const filteredNhanVat = nhanVat.filter((nv) => {
    const matchesSearch = nv.name.toLowerCase().includes(searchTerm.toLowerCase());
    const birthYear = parseInt(nv.birth_year) || 4000;
    const deathYear = parseInt(nv.death_year) || 4000;
    const matchesYear = (birthYear >= startYear && birthYear <= endYear) ||
                        (deathYear >= startYear && deathYear <= endYear)
                        ;
    return matchesSearch && matchesYear;
  });

  const suggestions = searchTerm
    ? nhanVat
        .filter((nv) => nv.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5)
    : [];

  // Pagination for nhan_vat
  const indexOfLastNhanVat = currentPage * nhanVatPerPage;
  const indexOfFirstNhanVat = indexOfLastNhanVat - nhanVatPerPage;
  const currentNhanVat = filteredNhanVat.slice(indexOfFirstNhanVat, indexOfLastNhanVat);
  const totalNhanVatPages = Math.ceil(filteredNhanVat.length / nhanVatPerPage);

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
    setCurrentPage(1);
  };

  const selectSuggestion = (name) => {
    setSearchTerm(name);
    setShowSuggestions(false);
    setCurrentPage(1);
  };

  const handleStartYearChange = (year) => {
    setStartYear(year);
    setCurrentPage(1);
  };

  const handleEndYearChange = (year) => {
    setEndYear(year);
    setCurrentPage(1);
  };

  return {
    nhanVat: currentNhanVat,
    fullNhanVat: nhanVat,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalNhanVatPages,
    nextPage,
    prevPage,
    searchTerm,
    setSearchTerm,
    showSuggestions,
    setShowSuggestions,
    suggestions,
    handleSearchChange,
    selectSuggestion,
    startYear,
    endYear,
    handleStartYearChange,
    handleEndYearChange,
  };
};
