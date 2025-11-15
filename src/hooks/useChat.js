// src/hooks/useChat.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * useChat
 *
 * - sessionId: generated client-side (or could come from server).
 * - sendMessage(text): POST to backend to request generation.
 * - SSE: connect to /api/chat/stream?sessionId=...
 *
 * Backend SSE contract (assumption):
 *   Events of type "message" with data: JSON { role: "assistant"|"system", text: "...", done: boolean }
 *   or data for user echo/ack.
 *
 * Adjust backend endpoints as needed.
 */

export function useChat({ streamUrl = '/api/chat/stream', postUrl = '/api/chat/message' } = {}) {
  const [sessionId] = useState(() => uuidv4());
  const [messages, setMessages] = useState([]); // { id, sender, text, streaming }
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const esRef = useRef(null);
  const lastAssistantMessageIdRef = useRef(null);

  // open SSE connection
  useEffect(() => {
    const url = `${streamUrl}?sessionId=${encodeURIComponent(sessionId)}`;
    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    es.onopen = () => {
      setConnected(true);
    };

    es.onerror = (e) => {
      console.error('SSE error', e);
      setError('Kết nối chat bị lỗi.');
      setConnected(false);
      // Do not close immediately; EventSource will attempt reconnection automatically
    };

    // generic "message" event
    es.addEventListener('message', (ev) => {
      // ev.data is expected to be JSON string
      try {
        const payload = JSON.parse(ev.data);
        // payload: { role, text, done, id? }
        handleIncomingChunk(payload);
      } catch (err) {
        console.warn('Không parse được data SSE:', ev.data, err);
      }
    });

    // optional: named events
    es.addEventListener('assistant', (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        handleIncomingChunk(payload);
      } catch (err) { /* ignore */ }
    });

    return () => {
      es.close();
      esRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, streamUrl]);

  const handleIncomingChunk = useCallback((payload) => {
    // expected payload shape: { role: 'assistant'|'system'|'user', text: '...', done: boolean, id?: string }
    const role = payload.role || 'assistant';
    const text = payload.text ?? '';
    const done = !!payload.done;
    const id = payload.id || lastAssistantMessageIdRef.current || `assistant-${Date.now()}`;

    // If this is assistant stream, append or create assistant message
    if (role === 'assistant') {
      setMessages((prev) => {
        // If last message is streaming assistant, append
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          if (last.sender === 'assistant' && last.streaming) {
            const updated = [...prev];
            updated[updated.length - 1] = { ...last, text: last.text + text, streaming: !done };
            return updated;
          }
        }
        // otherwise create new assistant message
        lastAssistantMessageIdRef.current = id;
        return [...prev, { id, sender: 'assistant', text, streaming: !done }];
      });
      if (done) {
        lastAssistantMessageIdRef.current = null;
      }
      return;
    }

    // handle other roles (system/user) - simply push
    setMessages((prev) => [...prev, { id: payload.id || `msg-${Date.now()}`, sender: role, text }]);
  }, []);

  // send a user message (POST) -> backend should accept and start streaming to SSE
  const sendMessage = useCallback(async (text) => {
    if (!text || !text.trim()) return null;
    const userMessage = { id: `user-${Date.now()}`, sender: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text.trim() }),
        credentials: 'include',
      });

      if (!res.ok) {
        const body = await res.text();
        setError('Gửi tin thất bại: ' + res.status + ' ' + body);
        return null;
      }
      // server accepted request; SSE will stream assistant response
      return true;
    } catch (err) {
      console.error('sendMessage error', err);
      setError('Lỗi mạng khi gửi tin.');
      return null;
    }
  }, [postUrl, sessionId]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return {
    sessionId,
    messages,
    connected,
    error,
    sendMessage,
    clearMessages,
  };
}
    