import React, { useEffect, useState, useRef } from 'react';
import { useThreads } from '../../hooks/useThreads';
import { getUser, getToken } from '../../utils/auth';
import './Chat.css';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

const API_PREFIX = 'http://localhost:8000/api';

const TAP_MAP = {
  1: "Lịch sử Việt Nam tập 01 Từ khởi thủy đến thế kỷ X-Cao Duy Mến-2013",
  2: "Lịch sử Việt Nam tập 02 Từ thế kỷ X đến thế kỷ XIV-Trần Thị Vinh-2014",
  3: "Lịch sử Việt Nam tập 03 Từ thế kỷ XV đến thế kỷ XVI-Tạ Ngọc Liễn-2017",
  4: "Lịch sử Việt Nam tập 04 Từ thế kỷ XVII đến thế kỷ XVIII-Trần Thị Vinh-2017",
  5: "Lịch sử Việt Nam tập 05 Từ năm 1802 đến năm 1858-Trương Thị Yến-2017",
  6: "Lịch sử Việt Nam tập 06 Từ năm 1858 đến năm 1896-Võ Kim Cương-2017",
  7: "Lịch sử Việt Nam tập 07 Từ năm 1897 đến năm 1918-Tạ Thị Thúy-2017",
  8: "Lịch sử Việt Nam tập 08 Từ năm 1919 đến năm 1930-Tạ Thị Thúy-2017",
  9: "Lịch sử Việt Nam tập 09 Từ năm 1930 đến năm 1945-Tạ Thị Thúy-2017",
  10: "Lịch sử Việt Nam tập 10 Từ năm 1945 đến năm 1950-Đinh Thị Thu Cúc-2017",
  11: "Lịch sử Việt Nam tập 11 Từ năm 1951 đến năm 1954-Nguyễn Văn Nhật-2017",
  12: "Lịch sử Việt Nam tập 12 Từ năm 1954 đến năm 1965-Trần Đức Cường-2017",
  13: "Lịch sử Việt Nam tập 13 Từ năm 1965 đến năm 1975-Nguyễn Văn Nhật-2017",
  14: "Lịch sử Việt Nam tập 14 Từ năm 1975 đến năm 1986-Trần Đức Cường-2017",
  15: "Lịch sử Việt Nam tập 15 Từ năm 1986 đến năm 2000-Nguyễn Ngọc Mão-2017",
  16: "Các Cụ Trạng Việt Nam - Phan Kế Bính",
  17: "Kể chuyện danh nhân Việt Nam tập 10 Các Nhà Chính Trị - Lê Minh Quốc",
  18: "Kể chuyện danh nhân Việt Nam tập 1 Các Vị Tổ Ngành Nghề Việt Nam - Lê Minh Quốc",
  19: "Kể chuyện danh nhân Việt Nam tập 6 Danh Nhân Cách Mạng - Lê Minh Quốc",
  20: "Kể chuyện danh nhân Việt Nam tập 7 Những Nhà Cải Cách Việt Nam - Lê Minh Quốc",
  21: "Thần Người và Đất Việt - Tạ Chí Đại Trường, 2007",
  22: "Việt Nam Phật Giáo Sử Lược - Mật Thể, NXB Tôn Giáo",
  23: "Các Triều Đại Việt Nam - Quỳnh Cư & Đỗ Đức Hùng, NXB Thanh Niên",
  24: "Giáo trình Lịch Sử Đảng - Bộ Giáo dục và Đào tạo"
};

function extractUserId(user) {
  if (!user) return null;
  return user.id || user.user_id || user._id || null;
}

export default function ChatPage() {
  const authUser = getUser();
  const token = getToken();
  const actualUserId = extractUserId(authUser) || localStorage.getItem('userId') || 'demo-user';
  const isLoggedIn = Boolean(extractUserId(authUser) || localStorage.getItem('userId') || token);

  const threadsHook = useThreads({ userId: actualUserId });
  const { threads, loading: threadsLoading, createThread, deleteThread, userId } = threadsHook;

  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [waitingFirstChunk, setWaitingFirstChunk] = useState(false);
  const controllerRef = useRef(null);

  const [selectedSourceIds, setSelectedSourceIds] = useState([]);

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleToggleSource = (id) => {
    setSelectedSourceIds(prev => {
      const idNum = Number(id);
      if (prev.includes(idNum)) {
        return prev.filter(item => item !== idNum);
      } else {
        return [...prev, idNum];
      }
    });
  };

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
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
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
    const FRIENDLY_ERROR = "Xin lỗi bạn, hệ thống đang có chút trục trặc :( Bạn hãy quay lại sau nhé!";
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

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

    const sourceList = selectedSourceIds.map(id => TAP_MAP[id]);

    let streamHadError = false;

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
          source: sourceList
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
                  streamHadError = true;
                  setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: FRIENDLY_ERROR, streaming: false } : m));
                  gotAnyChunk = true;
                  continue;
                }
                if (Object.prototype.hasOwnProperty.call(payload, 'context')) {
                  if (payload.context && String(payload.context).length > 0) {
                    setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: (m.content || '') + payload.context, streaming: true } : m));
                    gotAnyChunk = true;
                  }
                  continue;
                }
                setMessages((prev) => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: JSON.stringify(payload) }]);
              } catch (err) {
                setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: (m.content || '') + jsonStr, streaming: true } : m));
                gotAnyChunk = true;
              }
            }
          }
        }
        if (gotAnyChunk && waitingFirstChunk) setWaitingFirstChunk(false);
      }

      setMessages((prev) => {
        const found = prev.find(m => m.id === assistantId);
        if (!found) return prev;
        const contentEmpty = !found.content || String(found.content).trim().length === 0;
        if (contentEmpty) return prev.map(m => m.id === assistantId ? { ...m, content: FRIENDLY_ERROR, streaming: false } : m);
        return prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m);
      });

      setStreaming(false);
      setWaitingFirstChunk(false);
      controllerRef.current = null;

      if (!streamHadError) {
        try {
          const headers2 = token ? { Authorization: `Bearer ${token}` } : {};
          const reload = await fetch(`${API_PREFIX}/threads/${encodeURIComponent(selectedThreadId)}?user_id=${encodeURIComponent(userId)}`, { headers: headers2 });
          if (reload.ok) {
            const body = await reload.json();
            const formatted = (body.messages || []).map((m, idx) => ({
              id: m.id ?? `${m.role}-${idx}`,
              role: m.role || (m.sender || 'user'),
              content: m.content ?? m.text ?? '',
            }));
            setMessages(formatted);
          }
        } catch (e) {}
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        console.error('sendMessage error', err);
        setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: FRIENDLY_ERROR, streaming: false } : m));
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
          <h4>Danh sách đoạn chat</h4>
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
                onClick={() => { if (tid) setSelectedThreadId(tid); }}
              >
                <div className="threadTitle">Đoạn chat {display}</div>
                <div className="threadActions">
                  <button type="button" onClick={(e) => { e.stopPropagation(); if (tid) handleDeleteThread(tid); }} title="Xóa">✕</button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      <section className="chatMain">
        {!selectedThreadId ? (
          <div className="noThreadHint">Chọn đoạn chat bên trái hoặc tạo mới để bắt đầu đoạn chat mới!</div>
        ) : (
          <>
            <div className="chatMainHeader">
              <h4>Chat — {selectedThreadId}</h4>
              <div className="status">
                {streaming ? <span className="streamingBadge">Streaming...</span> : <span className="muted">Idle</span>}
              </div>
            </div>

            {showLoginPrompt && (
              <div className="loginPrompt">
                <div>
                  <strong>Bạn cần đăng nhập</strong>
                  <div>Vui lòng đăng nhập để bắt đầu đoạn chat.</div>
                </div>
                <div className="loginPromptActions">
                  <button onClick={() => { navigate('/login')}}>Đăng nhập</button>
                  <button onClick={() => setShowLoginPrompt(false)}>Đóng</button>
                </div>
              </div>
            )}

            <ChatMessages messages={messages} waitingFirstChunk={waitingFirstChunk} />
            <ChatInput onSend={sendMessage} disabled={streaming && waitingFirstChunk === false && false} />
          </>
        )}
      </section>

      <aside className="chatRightPanel">
        <div className="rightPanelHeader">
          <h3>Chọn nguồn tìm kiếm</h3>
          <div className="subtitle">Tick chọn các tập sách Lịch sử Việt Nam</div>
        </div>
        <div className="sourceList">
            {Object.entries(TAP_MAP).map(([key, title]) => {
                const idNum = Number(key);
                const isChecked = selectedSourceIds.includes(idNum);
                return (
                    <div key={key} className="sourceItem">
                        <label className="checkboxLabel">
                            <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => handleToggleSource(key)}
                            />
                            <span className="sourceTitle" title={title}>
                                {title}
                            </span>
                        </label>
                    </div>
                )
            })}
        </div>
        <div className="sourceFooter">
            <small>Đã chọn: {selectedSourceIds.length} cuốn</small>
            {selectedSourceIds.length > 0 && (
                <button className="clearBtn" onClick={() => setSelectedSourceIds([])}>Bỏ chọn tất cả</button>
            )}
        </div>
      </aside>
    </div>
  );
}
