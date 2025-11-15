// src/components/Chat/ChatInput.jsx
import React, { useState } from 'react';

export default function ChatInput({ onSend }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const t = text.trim();
    if (!t) return;
    setSending(true);
    try {
      await onSend(t);
      setText('');
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatInput">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        rows={2}
        placeholder="Gõ câu hỏi... (Enter để gửi, Shift+Enter xuống dòng)"
      />
      <div className="chatInputActions">
        <button onClick={handleSend} disabled={sending || !text.trim()}>
          {sending ? 'Đang gửi...' : 'Gửi'}
        </button>
      </div>
    </div>
  );
}
