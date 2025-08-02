import React, { useState, useEffect } from 'react';

const Sidebar = ({ threads, selectedUser, setSelectedUser, userEmail, onStartNewChat, selectedUserInfo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  // Get all threads including the currently selected user if not in threads
  const getAllThreads = () => {
    if (selectedUser && selectedUserInfo && !threads.some(thread => thread._id === selectedUser)) {
      return [selectedUserInfo, ...threads];
    }
    return threads;
  };

  // Search users function
  const searchUsers = async (query) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:3000/users?search=${encodeURIComponent(query)}`);
      const users = await response.json();
      
      // Filter out current user, users already in threads, and currently selected user
      const filteredUsers = users.filter(user => 
        user.email !== userEmail && 
        !threads.some(thread => thread._id === user.email) &&
        user.email !== selectedUser
      );
      
      setSearchResults(filteredUsers);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  // Handle user selection from search results
  const handleUserSelect = (user) => {
    setSelectedUser(user.email);
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
    if (onStartNewChat) {
      onStartNewChat(user.email);
    }
  };

  const allThreads = getAllThreads();

  return (
    <div style={{ width: 260, borderRight: '1px solid #eee', background: '#fafafa', overflowY: 'auto' }}>
      {/* Header with New Chat button */}
      <div style={{ padding: 16, borderBottom: '1px solid #eee' }}>
        <div style={{ marginBottom: 12 }}>
          <h3 className='font-extrabold text-primary text-2xl'>Chats</h3>
        </div>
        
        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          {isSearching && (
            <div style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '12px',
              color: '#888'
            }}>
              Searching...
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {showSearchResults && searchResults.length > 0 && (
        <div style={{ borderBottom: '1px solid #eee' }}>
          <div style={{ padding: '8px 16px', fontSize: '12px', color: '#888', background: '#f0f0f0' }}>
            Search Results
          </div>
          {searchResults.map((user) => (
            <div
              key={user.email}
              onClick={() => handleUserSelect(user)}
              style={{
                padding: 16,
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                background: 'white',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
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
                  background: user.photoURL ? 'transparent' : '#007bff',
                  color: user.photoURL ? 'transparent' : 'white',
                  fontSize: 16,
                  fontWeight: 'bold'
                }}>
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.name}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    getInitials(user.name || 'Unknown')
                  )}
                </div>
                
                {/* User Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 2 }}>
                    {user.name || 'Unknown User'}
                  </div>
                  <div style={{ fontSize: 13, color: '#888' }}>
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing Threads */}
      {!showSearchResults && (
        <>
          {allThreads.length === 0 && <div style={{ padding: 16 }}>No conversations yet.</div>}
          {allThreads.map((thread) => (
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
                    {thread.lastMessage || 'Start a conversation...'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Sidebar; 