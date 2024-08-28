import React from 'react';
import { IconButton } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';

const ChatIconButton = ({ onClick }) => {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        backgroundColor: (theme) => theme.palette.primary.light,
        color: (theme) => theme.palette.primary.dark,
        '&:hover': {
          backgroundColor: (theme) => theme.palette.primary.main,
          color: (theme) => theme.palette.background.alt,
        },
      }}
    >
      <ChatIcon />
    </IconButton>
  );
};

export default ChatIconButton;