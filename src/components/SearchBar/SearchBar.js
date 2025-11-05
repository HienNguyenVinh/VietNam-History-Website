import React from 'react';
import styles from './SearchBar.module.css';

const SearchBar = ({ searchTerm, showSuggestions, suggestions, onSearchChange, onSelectSuggestion }) => {
  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Search videos by title..."
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
