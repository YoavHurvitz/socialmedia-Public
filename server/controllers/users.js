import User from "../models/User.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params; // Extracting 'id' from request parameters
    const user = await User.findById(id); // Finding the user by id in the database
    res.status(200).json(user); // Sending user data as JSON response
  } catch (err) {
    res.status(404).json({ message: err.message }); // Handling errors and sending an error JSON response
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params; // Extracting 'id' from request parameters
    const user = await User.findById(id); // Finding the user by id in the database

    // Fetching all friends of the user concurrently
    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    // Formatting friends data to include specific fields
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends); // Sending formatted friends data as JSON response
  } catch (err) {
    res.status(404).json({ message: err.message }); // Handling errors and sending an error JSON response
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((fid) => fid.toString() !== friendId);
      friend.friends = friend.friends.filter((fid) => fid.toString() !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }

    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};