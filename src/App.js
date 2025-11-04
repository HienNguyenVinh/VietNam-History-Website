import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [videos, setVideos] = useState([]);
  const [events, setEvents] = useState([]);
  const [nhanVat, setNhanVat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const videosPerPage = 10;
  const nhanVatPerPage = 12;
  const eventsPerView = 1;

  useEffect(() => {
    fetchVideos();
    fetchEvents();
    fetchNhanVat();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/videos');
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      const data = await response.json();
      setVideos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    }
  };

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
    }
  };

  // Filter videos based on selected category and search term
  const filteredVideos = videos.filter((video) => {
    const matchesFilter = filter === 'All' || video.category === filter;
    const matchesSearch = video.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const suggestions = searchTerm
    ? videos
        .filter((video) => video.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5)
    : [];

  // Calculate pagination
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
    setCurrentPage(1);
  };

  const selectSuggestion = (title) => {
    setSearchTerm(title);
    setShowSuggestions(false);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
    setShowSuggestions(false);
    setTimelineIndex(0);
    setSelectedEvent(null);
  };

  const nextEvents = () => {
    if (timelineIndex + eventsPerView < events.length) {
      setTimelineIndex(timelineIndex + eventsPerView);
    }
  };

  const prevEvents = () => {
    if (timelineIndex > 0) {
      setTimelineIndex(timelineIndex - eventsPerView);
    }
  };

  const selectEvent = (event) => {
    setSelectedEvent(event);
  };

  const closeEventDetail = () => {
    setSelectedEvent(null);
  };

  const getFirstTwoSentences = (text) => {
    const sentences = text.split('.').filter(s => s.trim().length > 0);
    return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '');
  };

  // Pagination for nhan_vat
  const indexOfLastNhanVat = currentPage * nhanVatPerPage;
  const indexOfFirstNhanVat = indexOfLastNhanVat - nhanVatPerPage;
  const currentNhanVat = nhanVat.slice(indexOfFirstNhanVat, indexOfLastNhanVat);
  const totalNhanVatPages = Math.ceil(nhanVat.length / nhanVatPerPage);

  if (loading) return <div className="App">Loading videos...</div>;
  if (error) return <div className="App">Error: {error}</div>;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Học lịch sử</h1>
        <div className="tabs">
          <button onClick={() => handleTabChange('trang-chu')} className={activeTab === 'trang-chu' ? 'active' : ''}>Trang Chủ</button>
          <button onClick={() => handleTabChange('nhan-vat')} className={activeTab === 'nhan-vat' ? 'active' : ''}>Nhân Vật</button>
          <button onClick={() => handleTabChange('video')} className={activeTab === 'video' ? 'active' : ''}>Video</button>
        </div>
        {activeTab === 'video' && (
          <>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search videos by title..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((video) => (
                    <div
                      key={video.id}
                      className="suggestion-item"
                      onClick={() => selectSuggestion(video.name)}
                    >
                      {video.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="filter-buttons">
              <button onClick={() => handleFilterChange('All')} className={filter === 'All' ? 'active' : ''}>All</button>
              <button onClick={() => handleFilterChange('phim')} className={filter === 'phim' ? 'active' : ''}>Phim</button>
              <button onClick={() => handleFilterChange('video sự kiện')} className={filter === 'video sự kiện' ? 'active' : ''}>Video Sự Kiện</button>
              <button onClick={() => handleFilterChange('video nhân vật')} className={filter === 'video nhân vật' ? 'active' : ''}>Video Nhân Vật</button>
            </div>
          </>
        )}
      </header>
      <main>
        {activeTab === 'video' && (
          <>
            <div className="video-list">
              {currentVideos.map((video) => (
                <div key={video.id} className="video-item">
                  <h2>{video.name}</h2>
                  <p>{video.description}</p>
                  <p><strong>Category:</strong> <span className="category-badge">{video.category}</span></p>
                  <iframe
                    width="400"
                    height="225"
                    src={`https://www.youtube.com/embed/${video.link.split('v=')[1]}`}
                    title={video.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ))}
            </div>
            <div className="pagination">
              <button onClick={prevPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={nextPage} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          </>
        )}
        {activeTab === 'trang-chu' && (
        <div className="timeline-container">
  <button
    onClick={prevEvents}
    disabled={timelineIndex === 0}
    className="timeline-arrow left-arrow"
  >
    ←
  </button>

  <div className="timeline-wrapper">
    {/* 🔹 Milestone progress bar */}
     <div className="timeline-progress-bar">
    <div
      className="timeline-progress-fill"
      style={{
        width: `${((timelineIndex + 1) / events.length) * 100}%`,
      }}
    ></div>

    <div className="timeline-milestones">
      {events.map((event, index) => (
        <div
          key={index}
          className={`timeline-milestone ${index === timelineIndex ? "active" : ""}`}
          onClick={() => setTimelineIndex(index)}
        >
          <span className="milestone-label">
            {event.name.length > 10 ? event.name.slice(0, 10) + "…" : event.name}
          </span>
        </div>
      ))}
    </div>
  </div>

    {/* 🔹 Main timeline content */}
    <div className="horizontal-timeline">
      <div
        className="timeline-slider"
        style={{
          transform: `translateX(-${timelineIndex * 100}%)`,
        }}
      >
        {events.map((event, index) => (
          <div
            key={index}
            className="timeline-item"
            onClick={() => selectEvent(event)}
          >
            <div className="timeline-year">
              {`${event.start || "N/A"} - ${event.end || "N/A"}`}
            </div>
            <div className="timeline-content">
              <h3>{event.name}</h3>
              <p>{getFirstTwoSentences(event.description)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  <button
    onClick={nextEvents}
    disabled={timelineIndex >= events.length - 1}
    className="timeline-arrow right-arrow"
  >
    →
  </button>
</div>

        )}
        {selectedEvent && (
          <div className="event-detail-modal">
            <div className="event-detail-content">
              <button onClick={closeEventDetail} className="close-button">×</button>
              <h2>{selectedEvent.name}</h2>
              <p><strong>Years:</strong> { `${selectedEvent.start} - ${selectedEvent.end}`}</p>
              <p>{selectedEvent.description}</p>
            </div>
          </div>
        )}
        {activeTab === 'nhan-vat' && (
          <>
            <div className="nhan-vat-grid">
              {currentNhanVat.map((nv) => (
                <div key={nv.id} className="nhan-vat-item">
                  <img src={nv.image} alt={nv.name} />
                  <h3>{nv.name}</h3>
                  <p>{nv.description}</p>
                </div>
              ))}
            </div>
            <div className="pagination">
              <button onClick={prevPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span>Page {currentPage} of {totalNhanVatPages}</span>
              <button onClick={nextPage} disabled={currentPage === totalNhanVatPages}>
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
