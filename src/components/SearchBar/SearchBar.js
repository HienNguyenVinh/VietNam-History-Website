import React, { useEffect, useRef } from 'react';
import styles from './SearchBar.module.css';

const SearchBar = ({ searchTerm, showSuggestions, suggestions, onSearchChange, onSelectSuggestion, onHideSuggestions }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onHideSuggestions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onHideSuggestions]);

  return (
    <div className={styles.searchContainer} ref={dropdownRef}>
      <input
        type="text"
        placeholder="Search characters by name..."
        value={searchTerm}
        onChange={onSearchChange}
        className={styles.searchInput}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className={styles.suggestionsDropdown}>
          {suggestions.map((item) => (
            <div
              key={item.id}
              className={styles.suggestionItem}
              onClick={() => onSelectSuggestion(item.name)}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
