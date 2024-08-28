import Post from "../models/Post.js";
import User from "../models/User.js";

/**
 * Controller methods for managing posts in the social media app.
 */

/* CREATE */
export const createPost = async (req, res) => {
  try {
    // Destructure request body for userId, description, and picturePath
    const { userId, description, picturePath } = req.body;

    // Find user by userId from request
    const user = await User.findById(userId);

    // Create a new Post instance using data from request and user info
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},      // Initialize likes as an empty map
      comments: [],   // Initialize comments as an empty array
    });

    // Save the new post to the database
    await newPost.save();

    // Fetch all posts (including the newly created one)
    const posts = await Post.find();

    // Respond with the created post(s) as JSON
    res.status(201).json(posts);
  } catch (err) {
    // Handle errors (e.g., validation errors) and respond with error message
    res.status(409).json({ message: err.message });
  }
};

/* READ */
/**
 * Retrieves all posts from the database.
 */
export const getFeedPosts = async (req, res) => {
  try {
    // Fetch all posts and populate user details for comments
    const posts = await Post.find()
      .populate({
        path: 'comments.userId',
        select: 'firstName lastName picturePath'  // Include only the needed fields
      });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/**
 * Retrieves posts created by a specific user.
 * @param {string} userId - The ID of the user whose posts are to be retrieved.
 */
export const getUserPosts = async (req, res) => {
  try {
    // Extract userId from request parameters
    const { userId } = req.params;

    // Fetch posts where userId matches
    const posts = await Post.find({ userId });

    // Respond with the user's posts as JSON
    res.status(200).json(posts);
  } catch (err) {
    // Handle errors (e.g., user not found, database query errors) and respond with error message
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
/**
 * Toggles the like status of a post for a specific user.
 * @param {string} id - The ID of the post to be liked/unliked.
 * @param {string} userId - The ID of the user performing the like/unlike action.
 */
export const likePost = async (req, res) => {
  try {
    // Extract post ID and userId from request parameters and body
    const { id } = req.params;
    const { userId } = req.body;

    // Find the post by ID
    const post = await Post.findById(id);

    // Check if the user has already liked the post
    const isLiked = post.likes.get(userId);

    // Toggle like status: add like if not liked, remove if already liked
    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    // Update the post with the new likes map and retrieve the updated post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true } // Return the updated document
    );

    // Respond with the updated post as JSON
    res.status(200).json(updatedPost);
  } catch (err) {
    // Handle errors (e.g., post not found, database update errors) and respond with error message
    res.status(404).json({ message: err.message });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, text } = req.body;

    const user = await User.findById(userId);
    const post = await Post.findById(id);

    if (!user || !post) {
      return res.status(404).json({ message: "User or post not found" });
    }

    const newComment = {
      userId,
      text,
      date: new Date(),
    };

    post.comments.push(newComment);
    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};