import React, { useState } from 'react';
import './App.css';
import Tabs from './components/Tabs/Tabs';
import SearchBar from './components/SearchBar/SearchBar';
import FilterButtons from './components/FilterButtons/FilterButtons';
import VideoList from './components/VideoList/VideoList';
import EventTimeline from './components/EventTimeline/EventTimeline';
import NhanVatGrid from './components/NhanVatGrid/NhanVatGrid';
import Pagination from './components/Pagination/Pagination';
import { useVideos } from './hooks/useVideos';
import { useEvents } from './hooks/useEvents';
import { useNhanVat } from './hooks/useNhanVat';

function App() {
  const [activeTab, setActiveTab] = useState('trang-chu');

  const videosHook = useVideos();
  const eventsHook = useEvents();
  const nhanVatHook = useNhanVat();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    videosHook.setCurrentPage(1);
    videosHook.setSearchTerm('');
    videosHook.setShowSuggestions(false);
    eventsHook.setTimelineIndex(0);
    eventsHook.setSelectedEvent(null);
    nhanVatHook.setCurrentPage(1);
  };

  if (videosHook.loading || eventsHook.loading || nhanVatHook.loading) return <div className="App">Loading...</div>;
  if (videosHook.error || eventsHook.error || nhanVatHook.error) return <div className="App">Error: {videosHook.error || eventsHook.error || nhanVatHook.error}</div>;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Học lịch sử</h1>
        <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
        {activeTab === 'video' && (
          <>
            <SearchBar
              searchTerm={videosHook.searchTerm}
              showSuggestions={videosHook.showSuggestions}
              suggestions={videosHook.suggestions}
              onSearchChange={videosHook.handleSearchChange}
              onSelectSuggestion={videosHook.selectSuggestion}
            />
            <FilterButtons filter={videosHook.filter} onFilterChange={videosHook.handleFilterChange} />
          </>
        )}
      </header>
      <main>
        {activeTab === 'video' && (
          <>
            <VideoList videos={videosHook.videos} />
            <Pagination
              currentPage={videosHook.currentPage}
              totalPages={videosHook.totalPages}
              onPrevPage={videosHook.prevPage}
              onNextPage={videosHook.nextPage}
            />
          </>
        )}
        {activeTab === 'trang-chu' && (
          <EventTimeline
            events={eventsHook.events}
            timelineIndex={eventsHook.timelineIndex}
            selectedEvent={eventsHook.selectedEvent}
            onPrevEvents={eventsHook.prevEvents}
            onNextEvents={eventsHook.nextEvents}
            onSelectEvent={eventsHook.selectEvent}
            onCloseEventDetail={eventsHook.closeEventDetail}
            setTimelineIndex={eventsHook.setTimelineIndex}
          />
        )}
        {activeTab === 'nhan-vat' && (
          <>
            <NhanVatGrid nhanVat={nhanVatHook.nhanVat} />
            <Pagination
              currentPage={nhanVatHook.currentPage}
              totalPages={nhanVatHook.totalNhanVatPages}
              onPrevPage={nhanVatHook.prevPage}
              onNextPage={nhanVatHook.nextPage}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
