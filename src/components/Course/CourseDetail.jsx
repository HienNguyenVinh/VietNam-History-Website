import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourseDetail.css';
import { getToken, getUser } from '../../utils/auth';
import { getFirstTwoSentences } from '../../utils/getFirstTwoSentences';
export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [eventScores, setEventScores] = useState({});
  const [eventVideos, setEventVideos] = useState({});
  const [eventVideosLoading, setEventVideosLoading] = useState({});
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showvideoList,setshowvideoList] = useState(false);
  const [eventChars, setEventChars] = useState({});
  const [eventCharsLoading, setEventCharsLoading] = useState({});
  const [showCharList, setShowCharList] = useState({});
  const openQuiz = async (ev) => {
    setModalEvent(ev);
    setModalOpen(true);
    setQuestions([]);
    setAnswers({});
    try {
      const res = await fetch(`http://localhost:3001/api/events/${ev.id}/questions`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load questions');
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading questions', err);
      setQuestions([]);
    }
  };

  const submitQuiz = async (e) => {
    e.preventDefault();
    if (!modalEvent) return;
    const total = questions.length;
    if (total === 0) return;
    let correct = 0;
    for (const q of questions) {
      const sel = answers[q.id];
      // q.ans might be numeric index ("1","2","3") or the option text
      const correctOpt = (q.ans === '1' || q.ans === '2' || q.ans === '3') ? q['opt' + q.ans] : q.ans;
      if (sel && correctOpt && String(sel).trim() === String(correctOpt).trim()) correct += 1;
    }
    const score = Math.round((correct / total) * 100);

    const token = getToken();
    if (!token) {
      alert('Bạn cần đăng nhập để nộp bài.');
      return;
    }
    //const user = getUser();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:3001/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ courseid: course ? course.id : null,event_id: modalEvent.id, result: score })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit test');
      setEventScores(prev => ({ ...prev, [modalEvent.id]: score }));
      setModalOpen(false);
      setQuestions([]);
      setAnswers({});
    } catch (err) {
      console.error('Error submitting test', err);
      alert(err.message || 'Lỗi khi nộp bài');
    } finally {
      setSubmitting(false);
    }
  };

  const openVideos = async (ev) => {
    // if already loaded, just show modal later via list; otherwise load
    if (eventVideos[ev.id]) return;
    setEventVideosLoading(prev => ({ ...prev, [ev.id]: true }));
    try {
      const res = await fetch(`http://localhost:3001/api/events/${ev.id}/videos`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load videos');
      setEventVideos(prev => ({ ...prev, [ev.id]: Array.isArray(data) ? data : [] }));
    } catch (err) {
      console.error('Error loading videos', err);
      setEventVideos(prev => ({ ...prev, [ev.id]: [] }));
    } finally {
      setEventVideosLoading(prev => ({ ...prev, [ev.id]: false }));
    }
  };

  const openCharacters = async (ev) => {
    // toggle if already loaded
    if (eventChars[ev.id]) {
      return;
    }
    setEventCharsLoading(prev => ({ ...prev, [ev.id]: true }));
    try {
      const res = await fetch(`http://localhost:3001/api/events/${ev.id}/characters`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load characters');
      setEventChars(prev => ({ ...prev, [ev.id]: Array.isArray(data) ? data : [] }));
      setShowCharList(prev => ({ ...prev, [ev.id]: false }))
    } catch (err) {
      console.error('Error loading characters', err);
      setEventChars(prev => ({ ...prev, [ev.id]: [] }));
    } finally {
      setEventCharsLoading(prev => ({ ...prev, [ev.id]: false }));
    }
  };

  const openVideoModal = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setShowVideoModal(false);
  };

  useEffect(() => {
    // client-side guard: require authentication to view course detail
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [courseRes, eventsRes] = await Promise.all([
          fetch(`http://localhost:3001/api/courses`).then(r => r.json()),
          fetch(`http://localhost:3001/api/courses/${id}/events`).then(r => r.json())
        ]);

        // find course info
        const found = Array.isArray(courseRes) ? courseRes.find(c => String(c.id) === String(id)) : null;
        setCourse(found);
        setEvents(Array.isArray(eventsRes) ? eventsRes : []);
        // if logged in, fetch last saved test score per event
        const token = getToken();
        if (token && Array.isArray(eventsRes)) {
          const evs = Array.isArray(eventsRes) ? eventsRes : [];
          const scores = {};
          await Promise.all(evs.map(async (ev) => {
            try {
              const r = await fetch(`http://localhost:3001/api/events/${ev.id}/last-test`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (!r.ok) return;
              const d = await r.json();
              if (d && typeof d.result !== 'undefined') scores[ev.id] = d.result;
            } catch (e) {
              // ignore per-event fetch errors
            }
          }));
          setEventScores(prev => ({ ...prev, ...scores }));
        }
      } catch (err) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // When an event dropdown is opened, prefetch videos for that event so we can
  // decide whether to show the "Xem video" button and avoid a second fetch.
  useEffect(() => {
    if (openIndex == null) return;
    const ev = events[openIndex];
    if (!ev) return;
    // load videos if not already loaded and not loading
    if (!eventVideos[ev.id] && !eventVideosLoading[ev.id]) {
      openVideos(ev).catch(() => {});
    }
    // load characters if not already loaded and not loading
    if (!eventChars[ev.id] && !eventCharsLoading[ev.id]) {
      openCharacters(ev).catch(() => {});
    }
  }, [openIndex, events]);

  const getEmbedSrc = (link) => {
    if (!link) return null;
    try {
      const u = new URL(link);
      // youtube links
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
      }
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace(/^\//, '');
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    } catch (e) {
      // not a valid URL, fallthrough
    }
    // fallback to direct link (may be mp4 or another embeddable url)
    return link;
  };

  if (loading) return <div className="App">Loading course...</div>;
  if (error) return <div className="App">Error: {error}</div>;

  return (
    <div className="courseDetailPage">
      <h2 className="courseTitle">{course ? (course.title || course.name) : `Khóa ${id}`}</h2>
      {course && course.description && <p className="courseDesc">{course.description}</p>}

      <div className="courseEvents">
        {events.length === 0 && <div style={{ color: 'white' }}>Không có sự kiện cho khóa học này.</div>}
        {events.map((ev, idx) => (
          <div key={ev.id} className="courseEvent">
            <button
              className="eventToggle"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              <strong style={{ color: 'black' }}>{ev.title || ev.name || `Sự kiện ${ev.id}`}</strong>
              <span style={{ color: 'black' }}>{openIndex === idx ? '▲' : '▼'}</span>
            </button>
            {openIndex === idx && (
              <div className="eventBody">
                {ev.start && <div><strong>Bắt đầu:</strong> {ev.start}</div>}
                {ev.end && <div><strong>Kết thúc:</strong> {ev.end}</div>}
                {ev.name && <div><strong>Tên:</strong> {ev.name}</div>}
                {ev.description && <div style={{ marginTop: 6 }}>{ev.description}</div>}
                <div style={{ marginTop: 8 }}>
                  <button className="authSmallButton" onClick={() => openQuiz(ev)}>Kiểm tra</button>
                  {eventVideos[ev.id] && eventVideos[ev.id].length > 0 ? (
                    <button style={{ marginLeft: 8 }} className="authSmallButton" onClick={() => {setshowvideoList(true) }}>Xem video</button>
                  ) : (
                    // show button to load videos only if we don't yet know; we'll try to load when opening
                    null
                  )}
                  {eventChars[ev.id] && eventChars[ev.id].length > 0 ? (
                    <button style={{ marginLeft: 8 }} className="authSmallButton" onClick={() => setShowCharList(prev => ({ ...prev, [ev.id]: true }))}>Xem nhân vật</button>
                  ) : null}
                  {eventScores[ev.id] != null && (
                    <span style={{ marginLeft: 12, color: 'black', fontWeight: 700 }}>Điểm: {eventScores[ev.id]}%</span>
                  )}
                </div>
                {/* Videos list (if loaded) */}
                {eventVideosLoading[ev.id] && <div style={{ marginTop: 8 }}>Đang tải video...</div>}
                {eventVideos[ev.id] && eventVideos[ev.id].length > 0 && showvideoList&&(
                  <div className="eventVideos" style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: '6px 0' }}>Video liên quan</h4>
                      <button className="authSmallButton" onClick={() => setshowvideoList(false)}>Đóng danh sách</button>
                    </div>
                    <ul>
                      {eventVideos[ev.id].map(v => (
                        <li key={v.id} style={{ marginBottom: 8 }}>
                          <button className="videoPlayLink" onClick={() => openVideoModal(v)} style={{ fontWeight: 700 }}>{v.name || v.title || `Video ${v.id}`}</button>
                          {v.description && <div className="videoDesc">{v.description}</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Characters list (if loaded) */}
                {eventCharsLoading[ev.id] && <div style={{ marginTop: 8 }}>Đang tải nhân vật...</div>}
                {eventChars[ev.id] && eventChars[ev.id].length > 0 && showCharList[ev.id] && (
                  <div className="eventCharacters" style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: '6px 0' }}>Nhân vật liên quan</h4>
                      <button className="authSmallButton" onClick={() => setShowCharList(prev => ({ ...prev, [ev.id]: false }))}>Đóng danh sách</button>
                    </div>
                    <ul>
                      {eventChars[ev.id].map(nv => (
                        <li key={nv.id} style={{ marginBottom: 8 }}>
                          <a href={`/nhan-vat/${nv.id}`} className="videoPlayLink" style={{ fontWeight: 700 }}>{nv.name || nv.title || `Nhân vật ${nv.id}`}</a>
                          {nv.description && <div className="videoDesc">{getFirstTwoSentences(nv.description)}</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {modalOpen && modalEvent && (
        <div className="quizOverlay">
          <div className="quizCard">
            <h3>Kiểm tra: {modalEvent.title || modalEvent.name || modalEvent.id}</h3>
            {questions.length === 0 && <div>Không có câu hỏi.</div>}
            <form onSubmit={submitQuiz} className="quizForm">
              {questions.map((q, i) => (
                <div key={q.id} className="quizQuestion">
                  <div className="quizQ">{i + 1}. {q.question}</div>
                  <div className="quizOpts">
                    {[q.opt1, q.opt2, q.opt3].map((opt, oi) => (
                      <label key={oi} className="quizOptLabel">
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={opt || ''}
                          checked={answers[q.id] === (opt || '')}
                          onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt || '' }))}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="quizActions">
                <button type="button" className="authSmallButton" onClick={() => { setModalOpen(false); setQuestions([]); setAnswers({}); }}>Hủy</button>
                <button type="submit" className="authButton" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Nộp'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showVideoModal && selectedVideo && (
        <div className="videoOverlay" onClick={closeVideoModal}>
          <div className="videoCard" onClick={e => e.stopPropagation()}>
            <div className="videoHeader">
              <div style={{ fontWeight: 700 }}>{selectedVideo.name || selectedVideo.title || `Video ${selectedVideo.id}`}</div>
              <button className="videoCloseBtn" onClick={closeVideoModal}>Đóng</button>
            </div>
            <div className="videoFrameWrap">
              {(() => {
                const src = getEmbedSrc(selectedVideo.link);
                if (!src) return <div>Không thể nhúng video này.</div>;
                // if it's a youtube embed url
                if (src.includes('youtube.com/embed')) {
                  return <iframe title="video-player" src={src} allowFullScreen />;
                }
                // if it's an mp4 link
                if (src.endsWith('.mp4')) {
                  return <video controls src={src} />;
                }
                // fallback to iframe (some providers allow embedding)
                return <iframe title="video-player" src={src} allowFullScreen />;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
