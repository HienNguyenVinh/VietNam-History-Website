// src/components/Chat/ChatPage.jsx
import React from 'react';
import { useChat } from '../../hooks/useChat';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import './Chat.css';

export default function ChatPage() {
  const { sessionId, messages, connected, error, sendMessage, clearMessages } = useChat({
    streamUrl: '/api/chat/stream',
    postUrl: '/api/chat/message',
  });

  return (
    <div className="chatPage">
      <header className="chatHeader">
        <h2>Chat trợ lý</h2>
        <div className="chatStatus">
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
          <button onClick={() => clearMessages()} className="clearBtn">Xóa</button>
        </div>
      </header>

      {error && <div className="chatError">Lỗi: {error}</div>}

      <ChatMessages messages={messages} />

      <ChatInput onSend={sendMessage} />
      <footer className="chatFooter">
        <small>Session: {sessionId}</small>
      </footer>
    </div>
  );
}
