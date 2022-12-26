const User = require("../models/user");
const Post = require("../models/Post");
const FriendRequest = require("../models/friendRequest");
const { default: mongoose } = require("mongoose");

const getUser = async (req, res) => {
  try {
    const user = await User.findOne(
      { _id: req.params.id },
      { posts: 0, provider: 0 }
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { gender, userName, dateOfBrith } = req.body || {};
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: { gender, userName, dateOfBrith },
      },
      { returnOriginal: false }
    )
      .select({
        provider: 0,
        isAdmin: 0,
        posts: 0,
      })
      .exec();
    res.status(200).json({ user, message: "user updated sucessfully" });
  } catch (error) {}
};

const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      await User.deleteOne({ email });
      res.status(200).json({ user, message: "User has deleted!" });
    } else {
      res.status(400).json({ message: "User Not found!" });
    }
  } catch {
    res.status(500).json({ message: "internal error!" });
  }
};

const changeCover = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    const title =
      user.gender === "male"
        ? "updated his cover picture"
        : "updated her cover picture";

    const newPost = await new Post({
      ...req.body,
      title,
      userId: user._id,
      img:
        req.protocol + "://" + req.headers.host + "/cover/" + req.file.filename,
    }).save();

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          converPicture:
            req.protocol +
            "://" +
            req.headers.host +
            "/cover/" +
            req.file.filename,
        },
        $push: { posts: newPost._id },
      },
      {
        returnOriginal: false,
      }
    )
      .select({
        dateOfBrith: 0,
        profilePicture: 0,
        provider: 0,
        isAdmin: 0,
        desc: 0,
        relationShip: 0,
        gender: 0,
        posts: 0,
      })
      .exec();

    console.log(updateUser);
    res.status(200).json({ post: newPost, user: updatedUser });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

const changeProfile = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    const title =
      user.gender === "male"
        ? "updated his profile picture"
        : "updated her profile picture";

    const newPost = await new Post({
      ...req.body,
      title,
      userId: user._id,
      img:
        req.protocol +
        "://" +
        req.headers.host +
        "/profile/" +
        req.file.filename,
    }).save();

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          profilePicture:
            req.protocol +
            "://" +
            req.headers.host +
            "/profile/" +
            req.file.filename,
        },
        $push: { posts: newPost._id },
      },
      {
        returnOriginal: false,
      }
    )
      .select({
        dateOfBrith: 0,
        converPicture: 0,
        provider: 0,
        isAdmin: 0,
        desc: 0,
        relationShip: 0,
        gender: 0,
        posts: 0,
      })
      .exec();
    res.status(200).json({ post: newPost, user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const suggestionFriends = async (req, res) => {
  try {
    const { userId } = req.query || {};

    // Find users who are not the recipient of any friend requests
    const users = await User.aggregate([
      {
        $lookup: {
          from: "friendrequests", // The collection to join with
          let: { userId: "$_id" }, // Define a variable for the user's _id field
          pipeline: [
            // Match friend requests where the recipient field is equal to the user's _id field and the status field is not "pending"
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$recipient", "$$userId"],
                    },
                  },
                  {
                    status: { $eq: "pending" },
                  },
                ],
              },
            },
          ],
          as: "friendRequests", // The name of the array field in the output documents
        },
      },
      // Filter the joined documents to only include users who do not have any friend requests with a status other than "pending"
      {
        $match: {
          friendRequests: { $size: 0 },
          _id: { $ne: mongoose.Types.ObjectId(userId) },
        },
      },

      // Remove the friendRequests field from the output documents
      {
        $project: {
          friendRequests: 0,
        },
      },
    ]);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const { requestId } = req.params;
    const newRequest = await FriendRequest.findOneAndUpdate(
      {
        recipient: requestId,
        sender: userId,
      },
      { sender: userId, recipient: requestId, status: "pending" },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json({ message: "request sent successful", newRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body;

    await FriendRequest.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(requestId),
        sender: mongoose.Types.ObjectId(userId),
      },
      { $set: { status: "cancelled" } }
    );
    res.status(200).json({ message: "friend request canceled successfullly!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const accpectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params || {};
    await FriendRequest.findOneAndUpdate(
      { _id: requestId },
      { $set: { status: "accepted" } }
    );
    res.status(200).json({ message: "Request accepted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params || {};
    const { userId } = req.body || {};
    const d = await FriendRequest.findOneAndDelete({
      _id: requestId,
      recipient: userId,
    });
    res.status(200).json({ message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRequestList = async (req, res) => {
  try {
    const { currentUserId } = req.params;
    const receivedRequest = await FriendRequest.aggregate([
      {
        $match: {
          recipient: mongoose.Types.ObjectId(currentUserId),
          status: "pending",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "user_details",
        },
      },
    ]);

    res.status(200).json(receivedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUser,
  deleteUser,
  changeCover,
  changeProfile,
  updateUser,
  suggestionFriends,
  sendFriendRequest,
  cancelFriendRequest,
  getRequestList,
  accpectFriendRequest,
  deleteFriendRequest,
};
