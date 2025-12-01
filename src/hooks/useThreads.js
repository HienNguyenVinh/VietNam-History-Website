// src/hooks/useThreads.js
import { useEffect, useState, useCallback } from 'react';
import { getUser, getToken } from '../utils/auth';

const API_PREFIX = 'http://localhost:8000/api';

function extractUserId(user) {
  if (!user) return null;
  return user.id || user.user_id || user._id || null;
}

export function useThreads({ userId: explicitUserId } = {}) {
  const authUser = getUser();
  const token = getToken();
  const uid = explicitUserId || extractUserId(authUser) || localStorage.getItem('userId') || 'demo-user';

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeThreads = (raw) => {
    if (!Array.isArray(raw)) return [];
    return raw.map((t) => {
      if (t === null || t === undefined) return null;
      if (typeof t === 'string') return { thread_id: t };
      if (typeof t === 'object') {
        return {
          thread_id: t.thread_id ?? t.threadId ?? t.id ?? t._id ?? (t.thread ?? null),
          ...t,
        };
      }
      return null;
    }).filter(Boolean);
  };

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_PREFIX}/threads?user_id=${encodeURIComponent(uid)}`, {
        headers,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const normalized = normalizeThreads(data.threads || []);
      setThreads(normalized);
    } catch (err) {
      console.error('fetchThreads error', err);
      setError(err.message || 'Lỗi khi lấy danh sách thread');
    } finally {
      setLoading(false);
    }
  }, [uid, token]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const createThread = useCallback(async () => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_PREFIX}/threads`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ user_id: uid }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Create failed: ${res.status} ${txt}`);
      }
      const body = await res.json();
      await fetchThreads();
      return body.thread_id;
    } catch (err) {
      console.error('createThread error', err);
      setError(err.message || 'Không thể tạo thread');
      return null;
    }
  }, [uid, token, fetchThreads]);

  const deleteThread = useCallback(async (threadId) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_PREFIX}/threads/${encodeURIComponent(threadId)}?user_id=${encodeURIComponent(uid)}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error(`Delete failed ${res.status}`);
      await fetchThreads();
      return true;
    } catch (err) {
      console.error('deleteThread error', err);
      setError(err.message || 'Không thể xóa thread');
      return false;
    }
  }, [uid, token, fetchThreads]);

  return { threads, loading, error, fetchThreads, createThread, deleteThread, userId: uid };
}