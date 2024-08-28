import { Box, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Navbar from "../../scenes/navbar";
import FriendListWidget from "../../scenes/widgets/FriendListWidget";
import MyPostWidget from "../../scenes/widgets/MyPostWidget";
import PostsWidget from "../../scenes/widgets/PostsWidget";
import UserWidget from "../../scenes/widgets/UserWidget";

const ProfilePage = ({ socket }) => {
  const [user, setUser] = useState(null);
  const { userId } = useParams();
  const loggedInUserId = useSelector((state) => state.user._id);
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const isOwnProfile = loggedInUserId === userId;


  const getUser = async () => {
    const response = await fetch(`http://localhost:3001/users/${userId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setUser(data);
  };

  useEffect(() => {
    getUser();
  }, [userId]); // Refetch user data when URL changes

  if (!user) return null;

  const isCurrentUser = userId === loggedInUserId;

  return (
    <Box>
      <Navbar socket={socket} />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="2rem"
        justifyContent="center"
      >
        <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
          <UserWidget userId={userId} picturePath={user.picturePath || '/assets/default-user.png'} socket={socket} />
          <Box m="2rem 0" />
          <FriendListWidget userId={userId} isOwnProfile={isOwnProfile} />
        </Box>
        <Box
          flexBasis={isNonMobileScreens ? "42%" : undefined}
          mt={isNonMobileScreens ? undefined : "2rem"}
        >
          {isCurrentUser && <MyPostWidget picturePath={user.picturePath || '/assets/default-user.png'} />}
          <Box m="2rem 0" />
          <PostsWidget userId={userId} isProfile={true} socket={socket} />
        </Box>
      </Box> 
    </Box>
  );
};

export default ProfilePage;