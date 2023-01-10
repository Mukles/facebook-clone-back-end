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
    const { userId } = req.query;
    const requestList = await FriendRequest.find({
      $or: [{ sender: userId }, { recipient: userId }],
      status: { $in: ["pending", "accepted"] },
    });

    const requestIds = requestList.map((request) => {
      const { sender, recipient } = request;
      if (sender.toString() === userId) {
        return recipient;
      } else {
        return sender;
      }
    });

    const suggestionFriends = await User.find({
      _id: { $nin: [...requestIds, userId] },
    });
    res.status(200).json(suggestionFriends);
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
    const friend = await FriendRequest.findOneAndUpdate(
      { _id: requestId },
      { $set: { status: "accepted" } }
    );

    await User.findOneAndUpdate(
      { _id: friend.sender },
      { $addToSet: { friends: friend.recipient } }
    );

    await User.findOneAndUpdate(
      { _id: friend.recipient },
      { $addToSet: { friends: friend.sender } }
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
          as: "sender_details",
        },
      },
      {
        $project: { sender_details: 1, createdAt: 1 },
      },
      {
        $unwind: "$sender_details",
      },
    ]);

    res.status(200).json(receivedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRequestStatus = async (req, res) => {
  try {
    const { sender, recipient } = req.query;
    const status = await FriendRequest.find({
      sender: { $in: [sender, recipient] },
      recipient: { $in: [sender, recipient] },
    });
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNewsFeed = async (req, res) => {
  try {
    const { userId } = req.params;

    const latestPost = await User.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "friends",
          foreignField: "userId",
          as: "friendsPosts",
        },
      },
      {
        $unwind: "$friendsPosts",
      },
      {
        $lookup: {
          from: "users",
          localField: "friendsPosts.userId",
          foreignField: "_id",
          as: "friendsPosts.user",
        },
      },
      {
        $unwind: "$friendsPosts.user",
      },
      {
        $sort: {
          "friendsPosts.createdAt": -1,
        },
      },
      {
        $project: {
          friendsPosts: 1,
          _id: 0,
        },
      },
      {
        $skip: 0,
      },
      {
        $limit: 5,
      },
    ]);

    res.status(200).json(latestPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFriendList = async (req, res) => {
  try {
    const { userId } = req.params;
    const friends = await User.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "friends",
          foreignField: "_id",
          as: "friend_details",
        },
      },
      {
        $project: {
          friend_details: {
            userName: 1,
            profilePicture: 1,
            _id: 1,
          },
          _id: 0,
        },
      },
    ]);

    res.status(200).json(friends[0].friend_details);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDeails = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("userId", userId);
    const feild = Object.keys(req.body)[0];
    const value = req.body[feild];
    const update = { $addToSet: {} };
    update.$addToSet["details." + feild] = value;

    const user = await User.findOneAndUpdate({ _id: userId }, update, {
      new: true,
    });
    const updatedDetails = user.details;

    res.status(200).json(updatedDetails);
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
  getRequestStatus,
  getNewsFeed,
  getFriendList,
  updateDeails,
};
