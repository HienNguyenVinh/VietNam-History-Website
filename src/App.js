import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import SearchBar from './components/SearchBar/SearchBar';
import FilterButtons from './components/FilterButtons/FilterButtons';
import VideoList from './components/VideoList/VideoList';
import EventTimeline from './components/EventTimeline/EventTimeline';
import NhanVatGrid from './components/NhanVatGrid/NhanVatGrid';
import NhanVatDetail from './components/NhanVatDetail/NhanVatDetail';
import Pagination from './components/Pagination/Pagination';
import YearRangeFilter from './components/YearRangeFilter/YearRangeFilter';
import TitleFilter from './components/TitleFilter/TitleFilter';
import { useVideos } from './hooks/useVideos';
import { useEvents } from './hooks/useEvents';
import { useNhanVat } from './hooks/useNhanVat';

function App() {
  const location = useLocation();
  const videosHook = useVideos();
  const eventsHook = useEvents();
  const nhanVatHook = useNhanVat();
  const fullNhanVat = nhanVatHook.fullNhanVat;

  if (videosHook.loading || eventsHook.loading || nhanVatHook.loading) return <div className="App">Loading...</div>;
  if (videosHook.error || eventsHook.error || nhanVatHook.error) return <div className="App">Error: {videosHook.error || eventsHook.error || nhanVatHook.error}</div>;

  return (
    <div className="App">
      <header className="App-header">
        <h1><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Học lịch sử</Link></h1>
        <nav className="navLinks">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Trang chủ</Link>
          <Link to="/video" className={location.pathname === '/video' ? 'active' : ''}>Video</Link>
          <Link to="/nhan-vat" className={location.pathname.startsWith('/nhan-vat') ? 'active' : ''}>Nhân vật</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={
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
          } />
          <Route path="/video" element={
            <>
              <SearchBar
                searchTerm={videosHook.searchTerm}
                showSuggestions={videosHook.showSuggestions}
                suggestions={videosHook.suggestions}
                onSearchChange={videosHook.handleSearchChange}
                onSelectSuggestion={videosHook.selectSuggestion}
                onHideSuggestions={videosHook.hideSuggestions}
              />
              <FilterButtons filter={videosHook.filter} onFilterChange={videosHook.handleFilterChange} />
              <VideoList videos={videosHook.videos} />
              <Pagination
                currentPage={videosHook.currentPage}
                totalPages={videosHook.totalPages}
                onPrevPage={videosHook.prevPage}
                onNextPage={videosHook.nextPage}
              />
            </>
          } />
          <Route path="/nhan-vat" element={
            <>
              <div className="nhanVatHeader">
    <SearchBar
      searchTerm={nhanVatHook.searchTerm}
      showSuggestions={nhanVatHook.showSuggestions}
      suggestions={nhanVatHook.suggestions}
      onSearchChange={nhanVatHook.handleSearchChange}
      onSelectSuggestion={nhanVatHook.selectSuggestion}
      onHideSuggestions={nhanVatHook.hideSuggestions}
    />
    <TitleFilter
      selectedTitle={nhanVatHook.selectedTitle}
      onTitleChange={nhanVatHook.handleTitleChange}
      titles={nhanVatHook.titles}
    />
</div>

              <YearRangeFilter
                startYear={nhanVatHook.startYear}
                endYear={nhanVatHook.endYear}
                minYear={0}
                maxYear={2023}
                onStartYearChange={nhanVatHook.handleStartYearChange}
                onEndYearChange={nhanVatHook.handleEndYearChange}
              />
              <NhanVatGrid nhanVat={nhanVatHook.nhanVat} />
              <Pagination
                currentPage={nhanVatHook.currentPage}
                totalPages={nhanVatHook.totalNhanVatPages}
                onPrevPage={nhanVatHook.prevPage}
                onNextPage={nhanVatHook.nextPage}
              />
            </>
          } />
          <Route path="/nhan-vat/:id" element={<NhanVatDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;