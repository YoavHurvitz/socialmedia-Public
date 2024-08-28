import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

const ChatList = ({ onSelectChat }) => {
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  const getConversations = async () => {
    try {
      const response = await fetch(`http://localhost:3001/messages/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const allMessages = await response.json();

      // Group messages by unique users
      const groupedConversations = allMessages.reduce((acc, message) => {
        const otherId = message.sender === user._id ? message.receiver : message.sender;
        if (!acc[otherId]) {
          acc[otherId] = [];
        }
        acc[otherId].push(message);
        return acc;
      }, {});

      // Fetch user data for each conversation
      const userPromises = Object.keys(groupedConversations).map(async (userId) => {
        const userResponse = await fetch(`http://localhost:3001/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const userData = await userResponse.json();
        return {
          userId,
          name: `${userData.firstName} ${userData.lastName}`,
          profilePicture: `http://localhost:3001/assets/${userData.picturePath}` || '/assets/default-user.png',
          lastMessage: groupedConversations[userId][groupedConversations[userId].length - 1].content,
          timestamp: groupedConversations[userId][groupedConversations[userId].length - 1].timestamp,
        };
      });

      const conversationsArray = await Promise.all(userPromises);
      conversationsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setConversations(conversationsArray);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const getFriends = async () => {
    try {
      const response = await fetch(`http://localhost:3001/users/${user._id}/friends`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const friendsData = await response.json();
      setFriends(friendsData);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  useEffect(() => {
    getConversations();
  }, [user._id, token]);

  useEffect(() => {
    if (conversations.length === 0) {
      getFriends();
    }
  }, [conversations]);

  return (
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      {conversations.length > 0 ? (
        conversations.map((conversation) => (
          <ListItem
            key={conversation.userId}
            alignItems="flex-start"
            button
            onClick={() => onSelectChat(conversation.userId)}
          >
            <ListItemAvatar>
              <Avatar alt={conversation.name} src={conversation.profilePicture} />
            </ListItemAvatar>
            <ListItemText
              primary={conversation.name}
              secondary={
                <React.Fragment>
                  {conversation.lastMessage.substring(0, 30)}
                  {conversation.lastMessage.length > 30 ? '...' : ''}
                </React.Fragment>
              }
            />
          </ListItem>
        ))
      ) : friends.length > 0 ? (
        friends.map((friend) => (
          <ListItem
            key={friend._id}
            alignItems="flex-start"
            button
            onClick={() => onSelectChat(friend._id)}
          >
            <ListItemAvatar>
              <Avatar alt={friend.name} src={`http://localhost:3001/assets/${friend.picturePath}` || '/assets/default-user.png'} />
            </ListItemAvatar>
            <ListItemText
              primary={friend.name}
              secondary="Start a new chat"
            />
          </ListItem>
        ))
      ) : (
        <Typography align="center" sx={{ mt: 2 }}>
          Make friends to start chatting
        </Typography>
      )}
    </List>
  );
};

export default ChatList;