import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Chat.css';

export default function ChatMessages({ messages, waitingFirstChunk }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, waitingFirstChunk]);

  const mdComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      if (!inline) {
        return (
          <pre className="codeBlock" {...props}>
            <code className={className}>
              {children}
            </code>
          </pre>
        );
      } else {
        return (
          <code className="inlineCode" {...props}>
            {children}
          </code>
        );
      }
    },
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
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={mdComponents}
                    >
                      {m.content || ''}
                    </ReactMarkdown>
                  </div>
                  {m.streaming && <div className="streamingDots">◌</div>}
                </>
              ) : m.role === 'user' ? (
                <div className="content">{m.content}</div>
              ) : (
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

      {waitingFirstChunk && (
        <div className="chatMsg assistant placeholder">
          <div className="msgBubble">
            <em className="faint">Đang tìm kiếm thông tin…</em>
          </div>
        </div>
      )}
    </div>
  );
}
