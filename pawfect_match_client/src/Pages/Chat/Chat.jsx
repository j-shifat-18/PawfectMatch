import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Conversation from './Conversation';
import { io } from 'socket.io-client';
import useAuth from '../../Hooks/useAuth';

const SOCKET_URL = 'http://localhost:3000';

const Chat = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  // Pre-select recipient if coming from /adopt
  useEffect(() => {
    if (location.state && location.state.recipientEmail) {
      setSelectedUser(location.state.recipientEmail);
    }
  }, [location.state]);

  // Connect to socket
  useEffect(() => {
    if (user?.email) {
      socketRef.current = io(SOCKET_URL);
      socketRef.current.emit('join', user.email);
      socketRef.current.on('receive_message', (msg) => {
        if (
          (msg.fromEmail === user.email && msg.toEmail === selectedUser) ||
          (msg.fromEmail === selectedUser && msg.toEmail === user.email)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      });
      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [user, selectedUser]);

  // Fetch threads
  useEffect(() => {
    if (user?.email) {
      fetch(`http://localhost:3000/chat/threads?email=${user.email}`)
        .then((res) => res.json())
        .then(setThreads);
    }
  }, [user]);

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (user?.email && selectedUser) {
      fetch(`http://localhost:3000/chat/messages?user1=${user.email}&user2=${selectedUser}`)
        .then((res) => res.json())
        .then(setMessages);
    }
  }, [user, selectedUser]);

  const handleSendMessage = (content) => {
    const msg = {
      fromEmail: user.email,
      toEmail: selectedUser,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };
    socketRef.current.emit('send_message', msg);
    fetch('http://localhost:3000/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <div style={{ display: 'flex', height: '80vh', border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden' }}>
      <Sidebar
        threads={threads}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        userEmail={user?.email}
      />
      <Conversation
        messages={messages}
        onSendMessage={handleSendMessage}
        selectedUser={selectedUser}
        userEmail={user?.email}
      />
    </div>
  );
};

export default Chat; 