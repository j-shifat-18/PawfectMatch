import React from 'react';

const Sidebar = ({ threads, selectedUser, setSelectedUser, userEmail }) => {
  return (
    <div style={{ width: 260, borderRight: '1px solid #eee', background: '#fafafa', overflowY: 'auto' }}>
      <h3 style={{ padding: 16, margin: 0, borderBottom: '1px solid #eee' }}>Chats</h3>
      {threads.length === 0 && <div style={{ padding: 16 }}>No conversations yet.</div>}
      {threads.map((thread) => (
        <div
          key={thread._id}
          onClick={() => setSelectedUser(thread._id)}
          style={{
            padding: 16,
            cursor: 'pointer',
            background: selectedUser === thread._id ? '#e6f0ff' : 'transparent',
            borderBottom: '1px solid #eee',
            fontWeight: selectedUser === thread._id ? 'bold' : 'normal',
          }}
        >
          <div>{thread._id === userEmail ? 'You' : thread._id}</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
            {thread.lastMessage}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar; 