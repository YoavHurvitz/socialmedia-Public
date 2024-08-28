import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import ChatList from './ChatList';
import Chat from './Chat';

const ChatOverlay = ({ socket, userId, initialChatUserId, onClose }) => {
  const [activeChat, setActiveChat] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    if (initialChatUserId) {
      setActiveChat(initialChatUserId);
    }
  }, [initialChatUserId]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: '80%',
          height: '80%',
          backgroundColor: theme.palette.background.paper,
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: theme.shadows[5],
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" color={theme.palette.text.primary}>Chats</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          <Box sx={{ width: '30%', borderRight: `1px solid ${theme.palette.divider}` }}>
            <ChatList onSelectChat={(chatId) => setActiveChat(chatId)} />
          </Box>
          <Box sx={{ width: '70%' }}>
            {activeChat ? (
              <Chat
                socket={socket}
                receiverId={activeChat}
                onClose={() => setActiveChat(null)}
              />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color={theme.palette.text.primary}>Select a chat to start messaging</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatOverlay;