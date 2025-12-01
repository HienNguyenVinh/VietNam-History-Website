// src/components/Chat/ChatMessages.jsx
import React, { useEffect, useRef } from 'react';

export default function ChatMessages({ messages, waitingFirstChunk }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, waitingFirstChunk]);

  return (
    <div className="chatMessagesPane" ref={ref}>
      {messages.length === 0 && <div className="emptyHint">Bắt đầu bằng cách gửi câu hỏi...</div>}

      {messages.map((m) => (
        <div key={m.id} className={`chatMsg ${m.role === 'user' ? 'user' : (m.role === 'assistant' ? 'assistant' : 'system')}`}>
          <div className="msgBubble">
            {m.role === 'assistant' && (m.streaming || false) ? (
              <>
                <div className="assistantContent">{m.content}</div>
                <div className="streamingDots">◌</div>
              </>
            ) : (
              <div className="content">{m.content}</div>
            )}
          </div>
        </div>
      ))}

      {/* Khi đang gọi /chat/stream và chưa có chunk đầu tiên */}
      {waitingFirstChunk && (
        <div className="chatMsg assistant placeholder">
          <div className="msgBubble">
            <em className="faint">đang tìm kiếm thông tin…</em>
          </div>
        </div>
      )}
    </div>
  );
}
