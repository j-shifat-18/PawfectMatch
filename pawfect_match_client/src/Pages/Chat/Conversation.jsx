import React, { useRef, useEffect, useState } from 'react';

const Conversation = ({ messages, onSendMessage, selectedUser, selectedUserInfo, userEmail }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getDisplayName = () => {
    if (selectedUser === userEmail) return 'Yourself';
    if (selectedUserInfo) {
      return selectedUserInfo.firstName || selectedUserInfo.userName || selectedUser;
    }
    return selectedUser;
  };

  if (!selectedUser) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Select a chat to start messaging.</div>;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 16, borderBottom: '1px solid #eee', background: '#f5f5f5' }}>
        <b>Chat with <span className='text-primary'>{getDisplayName()}</span></b>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#fff' }}>
        {messages.map((msg, idx) => (
          <div
            key={msg._id || idx}
            style={{
              display: 'flex',
              justifyContent: msg.fromEmail === userEmail ? 'flex-end' : 'flex-start',
              marginBottom: 8,
            }}
          >
            <div
              style={{
                background: msg.fromEmail === userEmail 
                  ? (msg.isSending ? '#e3f2fd' : '#d1e7ff') 
                  : '#f0f0f0',
                color: '#222',
                padding: '8px 14px',
                borderRadius: 16,
                maxWidth: 320,
                wordBreak: 'break-word',
                opacity: msg.isSending ? 0.7 : 1,
              }}
            >
              {msg.content}
              <div style={{ fontSize: 11, color: '#888', marginTop: 2, textAlign: 'right' }}>
                {msg.isSending ? 'Sending...' : new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (input.trim()) {
            onSendMessage(input);
            setInput('');
          }
        }}
        style={{ display: 'flex', borderTop: '1px solid #eee', background: '#fafafa', padding: 12 }}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: 10, borderRadius: 16, border: '1px solid #ccc', outline: 'none' }}
        />
        <button type="submit" style={{ marginLeft: 8, padding: '0 18px', borderRadius: 16, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 'bold' }}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Conversation; 