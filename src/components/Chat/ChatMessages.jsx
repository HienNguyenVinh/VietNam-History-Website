// src/components/Chat/ChatMessages.jsx
import React, { useEffect, useRef } from 'react';

function MessageItem({ msg }) {
  const className = msg.sender === 'user' ? 'msg user' : (msg.sender === 'assistant' ? 'msg assistant' : 'msg system');
  return (
    <div className={className}>
      <div className="msgInner">
        <div className="msgText">{msg.text}</div>
        {msg.streaming && <div className="streamingIndicator">●</div>}
      </div>
    </div>
  );
}

export default function ChatMessages({ messages }) {
  const listRef = useRef(null);

  // auto-scroll to bottom when messages change
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="chatMessages" ref={listRef}>
      {messages.map((m) => (
        <MessageItem key={m.id} msg={m} />
      ))}
      {messages.length === 0 && <div className="emptyHint">Bắt đầu bằng cách gửi một câu hỏi về lịch sử.</div>}
    </div>
  );
}
