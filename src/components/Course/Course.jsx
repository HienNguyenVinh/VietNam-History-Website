import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Course.css';
import { getToken } from '../../utils/auth';
import { jwtDecode } from 'jwt-decode';
import { getFirst50Words } from '../../utils/getFirst50Words';
export default function Course() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      // require login to view courses
      const token = getToken();
      const { exp } = jwtDecode(token); // exp is in seconds
      const now = Date.now() / 1000;
      if (!token || exp < now) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/api/courses');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load courses');
        setCourses(data);
        // fetch progress for each course if user is logged in
        // token already available here
        if (token && Array.isArray(data)) {
          const map = {};
          await Promise.all(data.map(async (c) => {
            try {
              const r = await fetch(`http://localhost:3001/api/courses/${c.id}/progress`, { headers: { Authorization: `Bearer ${token}` } });
              if (!r.ok) return;
              const p = await r.json();
              map[c.id] = p;
            } catch (e) {
              // ignore per-course errors
            }
          }));
          setProgressMap(map);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="App">Loading courses...</div>;
  if (error) return <div className="App">Error: {error}</div>;

  return (
    <div className="coursePage">
      <h2 className="courseTitle">Khóa học</h2>
      {courses.length === 0 && <div>Không có khóa học nào.</div>}
      <div className="courseGrid">
        {courses.map(c => (
          <div key={c.id} className="courseCard">
            <h3>{c.title || c.name || `Khóa ${c.id}`}</h3>
            {c.description && <p>{getFirst50Words(c.description)}</p>}
            {/* Progress bar (if available) */}
            {progressMap[c.id] ? (
              <div className="courseProgress">
                <div className="progressLabel">Hoàn thành: {progressMap[c.id].completed}/{progressMap[c.id].total} ({progressMap[c.id].percent}%)</div>
                <div className="progressBar">
                  <div className="progressFill" style={{ width: `${progressMap[c.id].percent}%` }} />
                </div>
              </div>
            ) : null}
            <div className="courseCardActions">
              <Link to={`/course/${c.id}`} className="authSmallButton">Chi tiết</Link>
              {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="authSmallButton">Xem nguồn</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
