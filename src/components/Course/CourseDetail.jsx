import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourseDetail.css';
import { getToken } from '../../utils/auth';
import {jwtDecode} from 'jwt-decode';
export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventVideos, setEventVideos] = useState({});
  const [eventChars, setEventChars] = useState({});
  const [eventScores, setEventScores] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [timeLeft, setTimeLeft] = useState(0);
  const [timerId, setTimerId] = useState(null);

  const getEmbedSrc = (link) => {
    if (!link) return null;
    try {
      const u = new URL(link);
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
      }
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace(/^\//, '');
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    } catch (e) {}
    if (typeof link === 'string' && link.endsWith('.mp4')) return link;
    return link;
  };

  const renderVideoThumb = (v) => {
    try {
      const u = new URL(v.link);
      if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
        const vid = u.searchParams.get('v') || u.pathname.replace(/^\//, '');
        return <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt="thumb" />;
      }
    } catch (e) {}
    return <div className="thumbPlaceholder">▶</div>;
  };

  // Load course and events
  useEffect(() => {
    const token = getToken();
    const { exp } = jwtDecode(token); // exp is in seconds
          const now = Date.now() / 1000;
    if (!token || exp < now) {
      navigate('/login');
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [coursesRes, eventsRes] = await Promise.all([
          fetch('http://localhost:3001/api/courses').then(r => r.json()),
          fetch(`http://localhost:3001/api/courses/${id}/events`).then(r => r.json())
        ]);
        const found = Array.isArray(coursesRes) ? coursesRes.find(c => String(c.id) === String(id)) : null;
        setCourse(found);
        setEvents(Array.isArray(eventsRes) ? eventsRes : []);
        if (Array.isArray(eventsRes) && eventsRes.length > 0) setSelectedEvent(eventsRes[0]);

        const token = getToken();
        const scores = {};
        await Promise.all((eventsRes || []).map(async (ev) => {
          try {
            const r = await fetch(`http://localhost:3001/api/events/${ev.id}/last-test`, { headers: { Authorization: `Bearer ${token}` } });
            if (!r.ok) return;
            const d = await r.json();
            if (d && typeof d.result !== 'undefined') scores[ev.id] = d.result;
          } catch (e) {}
        }));
        setEventScores(scores);
      } catch (err) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  useEffect(() => {
    const ev = selectedEvent;
    if (!ev) return;
    (async () => {
      try {
        if (!eventVideos[ev.id]) {
          const r = await fetch(`http://localhost:3001/api/events/${ev.id}/videos`);
          const d = await r.json();
          if (r.ok) setEventVideos(prev => ({ ...prev, [ev.id]: Array.isArray(d) ? d : [] }));
        }
      } catch (e) {}
      try {
        if (!eventChars[ev.id]) {
          const r2 = await fetch(`http://localhost:3001/api/events/${ev.id}/characters`);
          const d2 = await r2.json();
          if (r2.ok) setEventChars(prev => ({ ...prev, [ev.id]: Array.isArray(d2) ? d2 : [] }));
        }
      } catch (e) {}
      try {
        const token = getToken();
        if (token) {
          const r3 = await fetch(`http://localhost:3001/api/events/${ev.id}/last-test`, { headers: { Authorization: `Bearer ${token}` } });
          if (r3.ok) {
            const d3 = await r3.json();
            if (d3 && typeof d3.result !== 'undefined') setEventScores(prev => ({ ...prev, [ev.id]: d3.result }));
          }
        }
      } catch (e) {}
    })();
  }, [selectedEvent]);

  useEffect(() => {
    if (modalOpen && timeLeft > 0) {
      const id = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      setTimerId(id);
    } else if (timeLeft === 0 && modalOpen) {
      handleSubmit();
    }
    return () => {
      if (timerId) {
        clearInterval(timerId);
        setTimerId(null);
      }
    };
  }, [modalOpen, timeLeft]);

  const openQuiz = async (ev) => {
    setModalEvent(ev);
    setModalOpen(true);
    setQuestions([]);
    setAnswers({});
    setTimeLeft(60);
    try {
      const res = await fetch(`http://localhost:3001/api/events/${ev.id}/questions`);
      const data = await res.json();
      if (res.ok) setQuestions(Array.isArray(data) ? data : []);
    } catch (e) { setQuestions([]); }
  };

  const handleSubmit = async () => {
    if (!modalEvent) return;
    const total = questions.length;
    if (total === 0) return;
    let correct = 0;
    for (const q of questions) {
      const sel = answers[q.id];
      const correctOpt = (q.ans === '1' || q.ans === '2' || q.ans === '3') ? q['opt' + q.ans] : q.ans;
      if (sel && correctOpt && String(sel).trim() === String(correctOpt).trim()) correct += 1;
    }
    const score = Math.round((correct / total) * 100);
    const token = getToken();
    if (!token) { alert('Bạn cần đăng nhập để nộp bài.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:3001/api/tests', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseid: course ? course.id : null, event_id: modalEvent.id, result: score })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setEventScores(prev => ({ ...prev, [modalEvent.id]: score }));
      setModalOpen(false); setQuestions([]); setAnswers({});
      if (timerId) { clearInterval(timerId); setTimerId(null); }
    } catch (err) { alert(err.message || 'Lỗi khi nộp bài'); }
    finally { setSubmitting(false); }
  };

  const submitQuiz = async (e) => {
    e.preventDefault();
    handleSubmit();
  };

  const openVideoModal = (v) => { setSelectedVideo(v); setShowVideoModal(true); };
  const closeVideoModal = () => { setSelectedVideo(null); setShowVideoModal(false); };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="courseDetailGrid">
      <aside className="leftColumn">
        <ul className="eventList">
          {events.map(ev => (
            <li key={ev.id} className={selectedEvent && String(selectedEvent.id) === String(ev.id) ? 'eventItem active' : 'eventItem'} onClick={() => setSelectedEvent(ev)}>
              <div className="eventItemTitle">{ev.title || ev.name || `Sự kiện ${ev.id}`}</div>
              <div className="eventItemMeta">{ev.start||''}-{ev.end||''}</div>
            </li>
          ))}
        </ul>
      </aside>

      <section className="middleColumn">
        {!selectedEvent ? (
          <div>Chọn một sự kiện để xem chi tiết.</div>
        ) : (
          <div className="middleInner">
            <h3 className="selectedTitle">{selectedEvent.title || selectedEvent.name}</h3>
            <div className="descriptionScroll">
              <div className="descFull" style={{ whiteSpace: 'pre-line' }}>
                {selectedEvent.image && (
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.name}
                    style={{
                      float: 'left',
                      marginRight: '10px',                      
                      width: '200px',
                      height: 'auto',
                      borderRadius: '5px'
                    }}
                  />
                )}
                {selectedEvent.description.replace(/\n{2,}/g, '\n')}
              </div>
            </div>
            <div className="middleFooter">
              <button className="authSmallButton" onClick={() => openQuiz(selectedEvent)}>Kiểm tra</button>
              <div className="scoreBox">{eventScores[selectedEvent.id] != null ? `Điểm: ${eventScores[selectedEvent.id]}%` : 'Điểm: -'}</div>
            </div>
          </div>
        )}
      </section>

      <aside className="rightColumn">
        <div className="videosColumn">
          <h4>Video</h4>
          {selectedEvent && eventVideos[selectedEvent.id] && eventVideos[selectedEvent.id].length > 0 ? (
            <div className="videosGrid">
              {eventVideos[selectedEvent.id].map(v => (
                <div key={v.id} className="videoCardSmall">
                  <button className="videoThumb" onClick={() => openVideoModal(v)}>{renderVideoThumb(v)}</button>
                  <div className="videoTitle">{v.name || v.title}</div>
                </div>
              ))}
            </div>
          ) : <div>Không có video.</div>}
        </div>

        <div className="charsColumn">
          <h4>Nhân vật</h4>
          {selectedEvent && eventChars[selectedEvent.id] && eventChars[selectedEvent.id].length > 0 ? (
            <ul className="charList">
              {eventChars[selectedEvent.id].map(nv => (
                <li key={nv.id}><a href={`/nhan-vat/${nv.id}`}>{nv.name || nv.title}</a></li>
              ))}
            </ul>
          ) : <div>Không có nhân vật.</div>}
        </div>
      </aside>

      {modalOpen && modalEvent && (
        <div className="quizOverlay">
          <div className="quizCard">
            <h3>Kiểm tra: {modalEvent.title || modalEvent.name || modalEvent.id}</h3>
            <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: timeLeft < 60 ? 'red' : 'black' }}>
              Thời gian còn lại: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
            {questions.length === 0 && <div>Không có câu hỏi.</div>}
            <form onSubmit={submitQuiz} className="quizForm">
              {questions.map((q, i) => (
                <div key={q.id} className="quizQuestion">
                  <div className="quizQ">{i + 1}. {q.question}</div>
                  <div className="quizOpts">
                    {[q.opt1, q.opt2, q.opt3].map((opt, oi) => (
                      <label key={oi} className="quizOptLabel">
                        <input type="radio" name={`q_${q.id}`} value={opt || ''}
                          checked={answers[q.id] === (opt || '')}
                          onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt || '' }))} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div className="quizActions">
                <button type="button" className="authSmallButton" onClick={() => { setModalOpen(false); setQuestions([]); setAnswers({}); if (timerId) { clearInterval(timerId); setTimerId(null); } }}>Hủy</button>
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
                if (src.includes('youtube.com/embed')) return <iframe title="video-player" src={src} allowFullScreen />;
                if (src.endsWith('.mp4')) return <video controls src={src} />;
                return <iframe title="video-player" src={src} allowFullScreen />;
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
