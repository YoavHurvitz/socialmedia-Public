import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  Send,
  ShareOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  InputBase,
  Typography,
  useTheme,
} from "@mui/material";
import FlexBetween from "../../components/FlexBetween";
import Friend from "../../components/Friend";
import WidgetWrapper from "../../components/WidgetWrapper";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "../../state";
import { format } from "date-fns";
import ChatIconButton from '../../components/ChatIcon';
import Chat from '../../components/Chat';
const API_URL = process.env.REACT_APP_API_URL;


const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
  hideAddRemove,
  socket,
  openChat,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [fullComments, setFullComments] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  useEffect(() => {
    const fetchFullComments = async () => {
      const promises = comments.map(async (comment) => {
        if (comment.firstName && comment.lastName) {
          return comment;
        }
        try {
          const response = await fetch(`${API_URL}/users/${comment.userId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = await response.json();
          if (userData && userData.firstName && userData.lastName) {
            return {
              ...comment,
              firstName: userData.firstName,
              lastName: userData.lastName,
              userPicturePath: userData.picturePath,
            };
          } else {
            // Handle case where user data is incomplete or null
            return {
              ...comment,
              firstName: "Unknown",
              lastName: "User",
              userPicturePath: "default-user.png",
            };
          }
        } catch (error) {
          console.error("Error fetching user data for comment:", error);
          // Handle error case
          return {
            ...comment,
            firstName: "Unknown",
            lastName: "User",
            userPicturePath: "default-user.png",
          };
        }
      });
      const fullCommentsData = await Promise.all(promises);
      setFullComments(fullCommentsData);
    };
    fetchFullComments();
  }, [comments, token]);

  const patchLike = async () => {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const postComment = async () => {
    const response = await fetch(
      `${API_URL}/posts/${postId}/comment`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loggedInUserId, text: commentText }),
      }
    );
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
    setCommentText("");
  };

  const handleChatClick = () => {
    openChat(postUserId);
  };

  const chatIcon = postUserId !== loggedInUserId ? (
    <ChatIconButton onClick={handleChatClick} />
  ) : null;

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
        hideAddRemove={hideAddRemove}
        chatIcon={chatIcon}
      />
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`${API_URL}/assets/${picturePath}`}
        />
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>
          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{fullComments.length}</Typography>
          </FlexBetween>
        </FlexBetween>
        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      {isComments && (
        <Box mt="0.5rem">
          {fullComments.map((comment, i) => {
            const commentDate = comment.date ? new Date(comment.date) : null;
            const isValidDate = commentDate && !isNaN(commentDate.getTime());
            return (
              <Box key={`${comment.userId}-${i}`}>
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    pl: "1rem",
                    mt: "0.5rem",
                  }}
                >
                  <Friend
                    friendId={comment.userId}
                    name={`${comment.firstName} ${comment.lastName}`}
                    userPicturePath={comment.userPicturePath || "default-user.png"}
                    hideAddRemove={true}
                  />
                  <Box sx={{ ml: "1rem", display: "flex", flexDirection: "column" }}>
                    <Typography sx={{ color: main }}>{comment.text}</Typography>
                    {isValidDate && (
                      <Typography
                        sx={{ color: main, fontSize: "0.75rem", marginTop: "0.25rem" }}
                      >
                        {format(commentDate, "PPpp")}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
          <Divider />
          <FlexBetween gap="1rem" mt="1rem">
            <InputBase
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{
                width: "100%",
                backgroundColor: palette.neutral.light,
                borderRadius: "2rem",
                padding: "0.5rem 1rem",
              }}
            />
            <IconButton
              onClick={postComment}
              sx={{ backgroundColor: palette.primary.light, p: "0.5rem" }}
            >
              <Send sx={{ color: palette.background }} />
            </IconButton>
          </FlexBetween>
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;