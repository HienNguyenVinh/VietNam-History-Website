import React, { useState } from 'react';

export default function ChatInput({ onSend, disabled = false }) {
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
    <div className="chatInputBar">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Gõ câu hỏi..."
        rows={2}
        disabled={disabled}
      />
      <div className="inputActions">
        <button type="button" onClick={handleSend} disabled={sending || !text.trim()}>
          {sending ? 'Đang gửi...' : 'Gửi'}
        </button>
      </div>
    </div>
  );
}
