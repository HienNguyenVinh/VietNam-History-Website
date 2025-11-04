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
          {suggestions.map((video) => (
            <div
              key={video.id}
              className={styles.suggestionItem}
              onClick={() => onSelectSuggestion(video.name)}
            >
              {video.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
