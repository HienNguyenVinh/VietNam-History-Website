// src/components/Chat/ChatMessages.jsx
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Chat.css'; // giữ style hiện có; mình thêm vài lớp CSS mẫu bên dưới

export default function ChatMessages({ messages, waitingFirstChunk }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, waitingFirstChunk]);

  // custom renderer for code blocks and inline code
  const mdComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      if (!inline) {
        // block code
        return (
          <pre className="codeBlock" {...props}>
            <code className={className}>
              {children}
            </code>
          </pre>
        );
      } else {
        // inline code
        return (
          <code className="inlineCode" {...props}>
            {children}
          </code>
        );
      }
    },
    // you can override other elements if you want, e.g. a, table, etc.
  };

  return (
    <div className="chatMessagesPane" ref={ref}>
      {messages.length === 0 && <div className="emptyHint">Bắt đầu bằng cách gửi câu hỏi...</div>}

      {messages.map((m) => {
        const roleClass = m.role === 'user' ? 'user' : (m.role === 'assistant' ? 'assistant' : 'system');
        return (
          <div key={m.id} className={`chatMsg ${roleClass}`}>
            <div className="msgBubble">
              {m.role === 'assistant' ? (
                <>
                  <div className="assistantContent">
                    {/* Render markdown — we deliberately DO NOT enable raw HTML parsing for safety */}
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={mdComponents}
                    >
                      {m.content || ''}
                    </ReactMarkdown>
                  </div>

                  {/* streaming indicator when assistant is streaming */}
                  {m.streaming && <div className="streamingDots">◌</div>}
                </>
              ) : m.role === 'user' ? (
                <div className="content">{m.content}</div>
              ) : (
                // system messages (errors, debug) — render plain text but allow small markdown too
                <div className="systemContent">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {m.content || ''}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        );
      })}

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
