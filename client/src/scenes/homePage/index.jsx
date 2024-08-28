import React, { useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import Navbar from "../navbar";
import UserWidget from "../widgets/UserWidget";
import MyPostWidget from "../widgets/MyPostWidget";
import PostsWidget from "../widgets/PostsWidget";
import AdvertWidget from "../widgets/AdvertWidget";
import FriendListWidget from "../widgets/FriendListWidget";
import ChatOverlay from "../../components/ChatOverlay";

const HomePage = ({ socket }) => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { _id, picturePath } = useSelector((state) => state.user);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatUserId, setActiveChatUserId] = useState(null);

  const openChat = (userId) => {
    setActiveChatUserId(userId);
    setIsChatOpen(true);
  };

  return (
    <Box>
      <Navbar socket={socket} />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="0.5rem"
        justifyContent="space-between"
      >
        <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
          <UserWidget userId={_id} picturePath={picturePath} />
        </Box>
        <Box
          flexBasis={isNonMobileScreens ? "42%" : undefined}
          mt={isNonMobileScreens ? undefined : "2rem"}
        >
          <MyPostWidget picturePath={picturePath} />
          <PostsWidget userId={_id} openChat={openChat} socket={socket} />
        </Box>
        {isNonMobileScreens && (
          <Box flexBasis="26%">
            <AdvertWidget />
            <Box m="2rem 0" />
            <FriendListWidget userId={_id} isOwnProfile={true}/>
          </Box>
        )}
      </Box>
      {isChatOpen && (
        <ChatOverlay
          socket={socket}
          userId={_id}
          initialChatUserId={activeChatUserId}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </Box>
  );
};

export default HomePage;