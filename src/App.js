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
import { useCourses } from './hooks/useCourses';
import { useNhanVat } from './hooks/useNhanVat';
import ChatPage from './components/Chat/ChatPage';
import Course from './components/Course/Course';
import CourseDetail from './components/Course/CourseDetail';
import { useNavigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { getUser, logout,getToken } from './utils/auth';
import { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
function App() {
  const location = useLocation();
  const videosHook = useVideos();
  const eventsHook = useEvents();
  const coursesHook = useCourses();
  const nhanVatHook = useNhanVat();
  const fullNhanVat = nhanVatHook.fullNhanVat;
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = getToken();
  const [mode, setMode] = useState('courses');
  const [items, setItems] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  useEffect(() => {
    if (mode === 'courses') {
      setItems(coursesHook.courses);
    }
  }, [coursesHook.courses, mode]);
  useEffect(() => {
    setUser(getUser());
  }, []);
  useEffect(() => {
    if (token) {
      const {exp} = jwtDecode(token);
      if (exp < Date.now() / 1000){ logout();setUser(null);}
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  const onSwitchToEvents = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const events = await response.json();
      setItems(events);
      setMode('events');
      setSelectedEvent(null);
      setTimelineIndex(0);
    } catch (err) {
      console.error(err);
    }
  };

  const onBackToCourses = () => {
    setMode('courses');
    setItems(coursesHook.courses);
    setSelectedCourseId(null);
    setTimelineIndex(0);
  };

  const onPrevEvents = () => {
    if (timelineIndex > 0) {
      setTimelineIndex(timelineIndex - 1);
    }
  };

  const onNextEvents = () => {
    if (timelineIndex < items.length - 1) {
      setTimelineIndex(timelineIndex + 1);
    }
  };

  const onSelectItem = (item) => {
    setSelectedEvent(item);
  };

  const onCloseDetail = () => {
    setSelectedEvent(null);
  };

  if (videosHook.loading || eventsHook.loading || nhanVatHook.loading || coursesHook.loading) return <div className="App">Loading...</div>;
  if (videosHook.error || eventsHook.error || nhanVatHook.error || coursesHook.error) return <div className="App">Error: {videosHook.error || eventsHook.error || nhanVatHook.error || coursesHook.error}</div>;

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Hồn Sử Việt</Link></h1>
          <div className="headerAuth">
            {user ? (
              <div className="headerUser">
                <span className="userName">Xin chào, {user.name}</span>
                <button className="authSmallButton" onClick={handleLogout}>Đăng xuất</button>
              </div>
            ) : (
              <div className="headerAuthLinks">
                <Link to="/login" className="authSmallButton">Đăng nhập</Link>
                <Link to="/register" className="authSmallButton">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
        <nav className="navLinks">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dòng Thời Gian</Link>
          <Link to="/video" className={location.pathname === '/video' ? 'active' : ''}>Video</Link>
          <Link to="/chat" className={location.pathname === '/chat' ? 'active' : ''}>Chat</Link>
          <Link to="/nhan-vat" className={location.pathname.startsWith('/nhan-vat') ? 'active' : ''}>Nhân vật</Link>
          
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={
            <>
            <EventTimeline
              items={items}
              mode={mode}
              timelineIndex={timelineIndex}
              selectedItem={selectedEvent}
              onPrev={onPrevEvents}
              onNext={onNextEvents}
              onSelectItem={onSelectItem}
              onCloseDetail={onCloseDetail}
              setTimelineIndex={setTimelineIndex}
              onSwitchToEvents={onSwitchToEvents}
              onBackToCourses={onBackToCourses}
              selectedCourseId={selectedCourseId}
            />
            <div className="learnsec">{user ? (<button onClick={()=>navigate('/course')}>Học ngay</button>) : (<span>Đăng nhập để học</span>)}</div></>
          } />
          <Route path="/course" element={<Course />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/video" element={
            <>
              <div className="videoHeader">
                <SearchBar
                  searchTerm={videosHook.searchTerm}
                  showSuggestions={videosHook.showSuggestions}
                  suggestions={videosHook.suggestions}
                  onSearchChange={videosHook.handleSearchChange}
                  onSelectSuggestion={videosHook.selectSuggestion}
                  onHideSuggestions={videosHook.hideSuggestions}
                />
                <FilterButtons filter={videosHook.filter} onFilterChange={videosHook.handleFilterChange} />
              </div>
              <VideoList videos={videosHook.videos} />
              <Pagination
                currentPage={videosHook.currentPage}
                totalPages={videosHook.totalPages}
                onPrevPage={videosHook.prevPage}
                onNextPage={videosHook.nextPage}
              />
            </>
          } />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
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
