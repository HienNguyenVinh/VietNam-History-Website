// src/components/Chat/ChatPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useThreads } from '../../hooks/useThreads';
import { getUser, getToken } from '../../utils/auth';
import './Chat.css';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

const API_PREFIX = 'http://localhost:8000/api'; // sửa nếu cần

function extractUserId(user) {
  if (!user) return null;
  return user.id || user.user_id || user._id || null;
}

export default function ChatPage() {
  const authUser = getUser();
  const token = getToken();
  const defaultUserId = extractUserId(authUser) || localStorage.getItem('userId') || 'demo-user';

  const threadsHook = useThreads({ userId: defaultUserId });
  const { threads, loading: threadsLoading, createThread, deleteThread, userId } = threadsHook;

  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [waitingFirstChunk, setWaitingFirstChunk] = useState(false);
  const controllerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function loadThread(tid) {
      if (!tid) {
        setMessages([]);
        return;
      }
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_PREFIX}/threads/${encodeURIComponent(tid)}?user_id=${encodeURIComponent(userId)}`, {
          headers,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        if (!mounted) return;
        const formatted = (body.messages || []).map((m, idx) => ({
          id: m.id ?? `${m.role}-${idx}`,
          role: m.role || (m.sender || 'user'),
          content: m.content ?? m.text ?? '',
        }));
        setMessages(formatted);
      } catch (err) {
        console.error('loadThread error', err);
        setMessages([]);
      }
    }
    loadThread(selectedThreadId);
    return () => { mounted = false; };
  }, [selectedThreadId, userId, token]);

  const handleNewThread = async () => {
    const newId = await createThread();
    if (newId) setSelectedThreadId(newId);
  };

  const handleDeleteThread = async (tid) => {
    const ok = await deleteThread(tid);
    if (ok && tid === selectedThreadId) {
      setSelectedThreadId(null);
      setMessages([]);
    }
  };

  const sendMessage = async (text) => {
    if (!selectedThreadId) {
      const newId = await createThread();
      if (!newId) return;
      setSelectedThreadId(newId);
    }

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: text };
    setMessages((s) => [...s, userMsg]);

    if (controllerRef.current) {
      try { controllerRef.current.abort(); } catch (e) {}
      controllerRef.current = null;
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setStreaming(true);
    setWaitingFirstChunk(true);

    const assistantId = `a-${Date.now()}`;
    setMessages((s) => [...s, { id: assistantId, role: 'assistant', content: '', streaming: true }]);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_PREFIX}/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: text,
          thread_id: selectedThreadId,
          user_id: userId,
          config: {},
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Stream request failed ${res.status}: ${txt}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let gotAnyChunk = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        let parts = buf.split('\n\n');
        buf = parts.pop();

        for (const part of parts) {
          if (!part.trim()) continue;
          const lines = part.split('\n').map(l => l.trim()).filter(Boolean);
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const jsonStr = line.slice(5).trim();
              try {
                const payload = JSON.parse(jsonStr);
                if (payload.error) {
                  setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: `Lỗi: ${payload.error}`, streaming: false } : m));
                  gotAnyChunk = true;
                } else if (payload.context) {
                  gotAnyChunk = true;
                  setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: (m.content || '') + payload.context, streaming: true } : m));
                } else {
                  setMessages((prev) => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: JSON.stringify(payload) }]);
                }
              } catch (err) {
                console.warn('failed parse sse json', jsonStr, err);
                setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: (m.content || '') + jsonStr, streaming: true } : m));
              }
            }
          }
        }

        if (gotAnyChunk && waitingFirstChunk) {
          setWaitingFirstChunk(false);
        }
      }

      setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m));
      setStreaming(false);
      setWaitingFirstChunk(false);
      controllerRef.current = null;

      try {
        const headers2 = token ? { Authorization: `Bearer ${token}` } : {};
        const reload = await fetch(`${API_PREFIX}/threads/${encodeURIComponent(selectedThreadId)}?user_id=${encodeURIComponent(userId)}`, {
          headers: headers2,
        });
        if (reload.ok) {
          const body = await reload.json();
          const formatted = (body.messages || []).map((m, idx) => ({
            id: m.id ?? `${m.role}-${idx}`,
            role: m.role || (m.sender || 'user'),
            content: m.content ?? m.text ?? '',
          }));
          setMessages(formatted);
        }
      } catch (e) { /* ignore */ }

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        console.error('sendMessage error', err);
        setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: `Lỗi: ${err.message}`, streaming: false } : m));
      }
      setStreaming(false);
      setWaitingFirstChunk(false);
      controllerRef.current = null;
    }
  };

  return (
    <div className="chatPageContainer">
      <aside className="chatSidebar">
        <div className="sidebarHeader">
          <h3>Threads</h3>
          <button type='button' onClick={handleNewThread} className="newThreadBtn">Tạo mới</button>
        </div>

        {threadsLoading && <div className="muted">Đang tải...</div>}
        <div className="threadList">
          {threads.length === 0 && <div className="muted">Chưa có cuộc trò chuyện nào</div>}
          {threads.map((t, idx) => {
            const tid = (t && t.thread_id) ? String(t.thread_id) : null;
            const display = tid ? (tid.length <= 8 ? tid : tid.slice(0, 8)) : `(no-id-${idx})`;
            const isActive = tid && tid === selectedThreadId;

            return (
              <div
                key={tid ?? `thread-${idx}`}
                className={`threadItem ${isActive ? 'active' : ''}`}
                onClick={() => { if (tid) setSelectedThreadId(tid); else console.warn('Thread missing id', t); }}
              >
                <div className="threadTitle">Thread {display}</div>
                <div className="threadActions">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); if (tid) handleDeleteThread(tid); else console.warn('Cannot delete thread without id', t); }}
                    title="Xóa"
                  >✕</button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      <section className="chatMain">
        {!selectedThreadId ? (
          <div className="noThreadHint">Chọn thread bên trái hoặc tạo mới để bắt đầu</div>
        ) : (
          <>
            <div className="chatMainHeader">
              <h4>Chat — {selectedThreadId}</h4>
              <div className="status">
                {streaming ? <span className="streamingBadge">Streaming...</span> : <span className="muted">Idle</span>}
              </div>
            </div>

            <ChatMessages messages={messages} waitingFirstChunk={waitingFirstChunk} />

            <ChatInput onSend={sendMessage} disabled={streaming && waitingFirstChunk === false && false} />
          </>
        )}
      </section>
    </div>
  );
}