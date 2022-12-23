const User = require("../models/user");
const Post = require("../models/Post");
const { default: mongoose } = require("mongoose");

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
    console.log("UserId", req.query);
    const { userId } = req.query || {};
    console.log("params", userId);
    const friends = await User.aggregate([
      { $match: { _id: { $ne: userId } } },
      {
        $project: { posts: 0, provider: 0 },
      },
      {
        $skip: 0,
      },
      {
        $limit: 5,
      },
    ]);

    res.status(200).json(friends);
  } catch (error) {
    console.log("error", "I am errer");
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  deleteUser,
  changeCover,
  changeProfile,
  updateUser,
  suggestionFriends,
};
