import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Avatar, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Chat = ({ socket, receiverId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [receiverData, setReceiverData] = useState(null);
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        // Fetch receiver data
        const receiverResponse = await fetch(`http://localhost:3001/users/${receiverId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const receiverData = await receiverResponse.json();
        setReceiverData({
          name: `${receiverData.firstName} ${receiverData.lastName}`,
          profilePicture: `http://localhost:3001/assets/${receiverData.picturePath}` || '/assets/default-user.png',
        });

        // Fetch previous messages
        const messagesResponse = await fetch(`http://localhost:3001/messages/${user._id}/${receiverId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const messagesData = await messagesResponse.json();
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      } catch (error) {
        console.error('Error fetching chat data:', error);
        setMessages([]);
      }
    };

    fetchChatData();

    // Listen for new messages
    if (socket) {
      socket.on('receive_message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
      }
    };
  }, [socket, user._id, receiverId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '' && socket) {
      const messageData = {
        sender: user._id,
        receiver: receiverId,
        content: inputMessage,
        timestamp: new Date().toISOString(),
      };
      socket.emit('send_message', messageData);
      setInputMessage('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {receiverData && (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: theme.palette.background.paper }}>
          <Avatar alt={receiverData.name} src={receiverData.profilePicture} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            <Link to={`/profile/${receiverId}`} style={{ textDecoration: 'underline', color: 'inherit' }}>
              {receiverData.name}
            </Link>
          </Typography>
        </Box>
      )}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {Array.isArray(messages) && messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.sender === user._id ? 'flex-end' : 'flex-start',
              mb: 1,
            }}
          >
            <Typography
              sx={{
                bgcolor: message.sender === user._id ? theme.palette.primary.light : theme.palette.grey[200],
                p: 1,
                borderRadius: 1,
                color: theme.palette.text.primary,
              }}
            >
              {message.content}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
                mt: 0.5,
              }}
            >
              {new Date(message.timestamp).toLocaleString()}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ p: 2, backgroundColor: theme.palette.background.default }}>
        <TextField
          fullWidth
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          variant="outlined"
          size="small"
          sx={{ backgroundColor: theme.palette.background.paper }}
        />
        <Button onClick={handleSendMessage} variant="contained" sx={{ mt: 1 }}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;