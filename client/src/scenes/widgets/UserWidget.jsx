import { ManageAccountsOutlined, EditOutlined, LocationOnOutlined, WorkOutlineOutlined, PersonAddOutlined, PersonRemoveOutlined } from "@mui/icons-material";
import { Box, Typography, Divider, useTheme, IconButton } from "@mui/material";
import UserImage from "../../components/UserImage";
import FlexBetween from "../../components/FlexBetween";
import WidgetWrapper from "../../components/WidgetWrapper";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setFriends } from "../../state";
import ChatIconButton from '../../components/ChatIcon';
import ChatOverlay from '../../components/ChatOverlay';

const UserWidget = ({ userId, picturePath, socket }) => {
  const [user, setUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { palette } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUser = useSelector((state) => state.user);
  const friends = useSelector((state) => state.user.friends) || [];
  const dark = palette.neutral.dark;
  const medium = palette.neutral.medium;
  const main = palette.neutral.main;
  const API_URL = process.env.REACT_APP_API_URL;
  const isOwnProfile = loggedInUser._id === userId;
  const isFriend = Array.isArray(friends) && friends.find((friend) => friend._id === loggedInUser._id);

  const getUser = async () => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setUser(data);
  };

  const patchFriend = async () => {
    const response = await fetch(
      `${API_URL}/users/${loggedInUser._id}/${userId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const updatedFriends = await response.json();
    dispatch(setFriends({ friends: updatedFriends }));
    window.location.reload();
  };

  useEffect(() => {
    getUser();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return null;
  }

  const { firstName, lastName, location, occupation, viewedProfile, impressions, friends: userFriends } = user;

  const handleChatClick = () => {
    setIsChatOpen(true);
  };

  return (
    <WidgetWrapper>
      {/* FIRST ROW */}
      <FlexBetween gap="0.5rem" pb="1.1rem">
        <FlexBetween gap="1rem">
          <UserImage image={picturePath || '/assets/default-user.png'} />
          <Box>
            <Typography
              variant="h4"
              color={dark}
              fontWeight="500"
              sx={{ "&:hover": { color: palette.primary.light, cursor: "pointer" } }}
              onClick={() => navigate(`/profile/${userId}`)}
            >
              {firstName} {lastName}
            </Typography>
            <Typography color={medium}>{userFriends.length} friends</Typography>
          </Box>
        </FlexBetween>
        {!isOwnProfile && (
          <>
            <IconButton
              onClick={patchFriend}
              sx={{ backgroundColor: palette.primary.light, p: "0.6rem" }}
            >
              {isFriend ? (
                <PersonRemoveOutlined sx={{ color: palette.primary.dark }} />
              ) : (
                <PersonAddOutlined sx={{ color: palette.primary.dark }} />
              )}
            </IconButton>
            <ChatIconButton onClick={handleChatClick} />
          </>
        )}
        {isOwnProfile && <ManageAccountsOutlined />}
      </FlexBetween>
      {isChatOpen && (
        <ChatOverlay
          socket={socket}
          receiverId={userId}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      <Divider />

      {/* SECOND ROW */}
      <Box p="1rem 0">
        <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
          <LocationOnOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{location}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap="1rem">
          <WorkOutlineOutlined fontSize="large" sx={{ color: main }} />
          <Typography color={medium}>{occupation}</Typography>
        </Box>
      </Box>

      <Divider />

      {/* THIRD ROW */}
      <Box p="1rem 0">
        <FlexBetween mb="0.5rem">
          <Typography color={medium}>Who's viewed your profile</Typography>
          <Typography color={main} fontWeight="500">
            {viewedProfile}
          </Typography>
        </FlexBetween>
        <FlexBetween>
          <Typography color={medium}>Impressions of your post</Typography>
          <Typography color={main} fontWeight="500">
            {impressions}
          </Typography>
        </FlexBetween>
      </Box>

      <Divider />

      {/* FOURTH ROW */}
      <Box p="1rem 0">
        <Typography fontSize="1rem" color={main} fontWeight="500" mb="1rem">
          Social Profiles
        </Typography>

        <FlexBetween gap="1rem" mb="0.5rem">
          <FlexBetween gap="1rem">
            <img src="../assets/twitter.png" alt="twitter" />
            <Box>
              <Typography color={main} fontWeight="500">
                Twitter
              </Typography>
              <Typography color={medium}>Social Network</Typography>
            </Box>
          </FlexBetween>
          <EditOutlined sx={{ color: main }} />
        </FlexBetween>

        <FlexBetween gap="1rem">
          <FlexBetween gap="1rem">
            <img src="../assets/linkedin.png" alt="linkedin" />
            <Box>
              <Typography color={main} fontWeight="500">
                Linkedin
              </Typography>
              <Typography color={medium}>Network Platform</Typography>
            </Box>
          </FlexBetween>
          <EditOutlined sx={{ color: main }} />
        </FlexBetween>
      </Box>
    </WidgetWrapper>
  );
};

export default UserWidget;