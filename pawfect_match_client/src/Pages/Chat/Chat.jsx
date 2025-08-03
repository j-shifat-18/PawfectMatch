import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Conversation from './Conversation';
import { io } from 'socket.io-client';
import useAuth from '../../Hooks/useAuth';
import useAxiosSecure from '../../Hooks/useAxiosSecure';

const SOCKET_URL = 'http://localhost:3000';

const Chat = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const location = useLocation();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserInfo, setSelectedUserInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sendingMessages, setSendingMessages] = useState(new Set());
  const socketRef = useRef(null);

  // Pre-select recipient if coming from /adopt
  useEffect(() => {
    if (location.state && location.state.recipientEmail) {
      setSelectedUser(location.state.recipientEmail);
    }
  }, [location.state]);

  // Function to fetch user information for a specific email
  const fetchUserInfo = async (email) => {
    try {
      const response = await axiosSecure.get(`/users?email=${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  };

  // Function to update threads with new message
  const updateThreadsWithMessage = async (message) => {
    setThreads(prevThreads => {
      const otherUser = message.fromEmail === user.email ? message.toEmail : message.fromEmail;
      
      // Check if thread already exists
      const existingThreadIndex = prevThreads.findIndex(thread => thread._id === otherUser);
      
      if (existingThreadIndex !== -1) {
        // Update existing thread
        const updatedThreads = [...prevThreads];
        updatedThreads[existingThreadIndex] = {
          ...updatedThreads[existingThreadIndex],
          lastMessage: message.content,
          lastDate: message.createdAt
        };
        // Move updated thread to top
        const updatedThread = updatedThreads.splice(existingThreadIndex, 1)[0];
        return [updatedThread, ...updatedThreads];
      } else {
        // Create new thread with placeholder data
        const newThread = {
          _id: otherUser,
          lastMessage: message.content,
          lastDate: message.createdAt,
          userName: 'Loading...',
          userPhotoURL: null,
          firstName: 'Loading...'
        };
        
        // Fetch user information for the new thread
        fetchUserInfo(otherUser).then(userData => {
          if (userData) {
            setThreads(currentThreads => 
              currentThreads.map(thread => 
                thread._id === otherUser 
                  ? {
                      ...thread,
                      userName: userData.name || 'Unknown User',
                      userPhotoURL: userData.photoURL || null,
                      firstName: userData.name ? userData.name.split(' ')[0] : 'Unknown'
                    }
                  : thread
              )
            );
          }
        });
        
        return [newThread, ...prevThreads];
      }
    });
  };

  // Function to fetch updated threads
  const fetchThreads = async () => {
    if (user?.email) {
      try {
        const response = await axiosSecure.get(`/chat/threads?email=${user.email}`);
        const updatedThreads = response.data;
        setThreads(updatedThreads);
      } catch (error) {
        console.error('Error fetching threads:', error);
      }
    }
  };

  // Function to handle starting a new chat
  const handleStartNewChat = (recipientEmail) => {
    setSelectedUser(recipientEmail);
    setMessages([]); // Clear messages for new chat
    
    // Fetch user info for the new chat but don't add to threads yet
    fetchUserInfo(recipientEmail).then(userData => {
      if (userData) {
        const newThread = {
          _id: recipientEmail,
          lastMessage: '',
          lastDate: new Date().toISOString(),
          userName: userData.name || 'Unknown User',
          userPhotoURL: userData.photoURL || null,
          firstName: userData.name ? userData.name.split(' ')[0] : 'Unknown'
        };
        
        // Only set the selected user info, don't add to threads yet
        setSelectedUserInfo(newThread);
      }
    });
  };

  // Connect to socket
  useEffect(() => {
    if (user?.email) {
      socketRef.current = io(SOCKET_URL);
      socketRef.current.emit('join', user.email);
      
      socketRef.current.on('receive_message', (msg) => {
        console.log('Received socket message:', msg);
        
        // Update messages if it's for the current conversation
        if (
          (msg.fromEmail === user.email && msg.toEmail === selectedUser) ||
          (msg.fromEmail === selectedUser && msg.toEmail === user.email)
        ) {
          console.log('Processing message for current conversation');
          setMessages((prev) => {
            // For messages from current user, replace any temporary messages with the real one
            if (msg.fromEmail === user.email) {
              console.log('Replacing temporary message with real one');
              // Remove any temporary messages with the same content
              const filteredMessages = prev.filter(existingMsg => 
                !(existingMsg.isSending && existingMsg.content === msg.content)
              );
              return [...filteredMessages, msg];
            }
            
            // For messages from other users, just add them (no duplicates expected)
            return [...prev, msg];
          });
          
          // Clear sending state for current user's messages
          if (msg.fromEmail === user.email) {
            console.log('Clearing sending state');
            setSendingMessages(prev => {
              const newSet = new Set(prev);
              // Clear all sending messages since we got confirmation
              return new Set();
            });
          }
        }
        
        // Update threads for all received messages
        updateThreadsWithMessage(msg);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [user, selectedUser]);

  // Fetch threads
  useEffect(() => {
    fetchThreads();
  }, [user]);

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (user?.email && selectedUser) {
      axiosSecure.get(`/chat/messages?user1=${user.email}&user2=${selectedUser}`)
        .then((res) => setMessages(res.data))
        .catch((error) => console.error('Error fetching messages:', error));
    }
  }, [user, selectedUser]);

  // Update selected user info when selectedUser changes
  useEffect(() => {
    if (selectedUser && threads.length > 0) {
      const userThread = threads.find(thread => thread._id === selectedUser);
      setSelectedUserInfo(userThread || null);
    }
  }, [selectedUser, threads]);

  const handleSendMessage = (content) => {
    const msg = {
      fromEmail: user.email,
      toEmail: selectedUser,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };
    
    // Add message to sending state for immediate feedback
    const tempId = `temp_${Date.now()}`;
    const tempMsg = { ...msg, _id: tempId, isSending: true };
    setMessages((prev) => [...prev, tempMsg]);
    setSendingMessages(prev => new Set(prev).add(tempId));
    
    socketRef.current.emit('send_message', msg);
    axiosSecure.post('/chat/message', msg)
      .catch((error) => console.error('Error sending message:', error));
    
    // Update threads immediately for sent messages
    updateThreadsWithMessage(msg);
    
    // Set a timeout to remove sending state after 5 seconds
    setTimeout(() => {
      setMessages((prev) => 
        prev.map(message => 
          message.isSending && message.content === content 
            ? { ...message, isSending: false }
            : message
        )
      );
      setSendingMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
    }, 5000);
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="flex flex-1" style={{ border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden' }}>
        <Sidebar
          threads={threads}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          userEmail={user?.email}
          onStartNewChat={handleStartNewChat}
          selectedUserInfo={selectedUserInfo}
        />
        <Conversation
          messages={messages}
          onSendMessage={handleSendMessage}
          selectedUser={selectedUser}
          selectedUserInfo={selectedUserInfo}
          userEmail={user?.email}
        />
      </div>
    </div>
  );
};

export default Chat; 