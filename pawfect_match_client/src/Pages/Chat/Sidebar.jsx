import React from 'react';

const Sidebar = ({ threads, selectedUser, setSelectedUser, userEmail }) => {
  const getDisplayName = (thread) => {
    if (thread._id === userEmail) return 'You';
    return thread.firstName || thread.userName || thread._id;
  };

  const getProfilePicture = (thread) => {
    if (thread._id === userEmail) return null; // Don't show picture for "You"
    return thread.userPhotoURL;
  };

  const getInitials = (name) => {
    if (!name || name === 'Unknown') return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div style={{ width: 260, borderRight: '1px solid #eee', background: '#fafafa', overflowY: 'auto' }}>
      <h3 style={{ padding: 16, margin: 0, borderBottom: '1px solid #eee' }} className='font-extrabold text-primary text-2xl'>Chats</h3>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Profile Picture or Initials */}
            <div style={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: getProfilePicture(thread) ? 'transparent' : '#007bff',
              color: getProfilePicture(thread) ? 'transparent' : 'white',
              fontSize: 16,
              fontWeight: 'bold'
            }}>
              {getProfilePicture(thread) ? (
                <img 
                  src={getProfilePicture(thread)} 
                  alt={getDisplayName(thread)}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                getInitials(getDisplayName(thread))
              )}
            </div>
            
            {/* User Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 2 }}>
                {getDisplayName(thread)}
              </div>
              <div style={{ fontSize: 13, color: '#888' }}>
                {thread.lastMessage}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar; 