const User = require("../models/user");
const Post = require("../models/Post");

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

const updateUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      await User.deleteOne({ email });
      res.status(200).json({ user, message: "User has deleted!" });
    } else {
      res.status(400).json({ message: "User Not found!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          converPicture:
            req.protocol +
            "://" +
            req.headers.host +
            "/cover/" +
            req.file.filename,
        },
      },
      { $push: { posts: newPost._id } }
    );
    res.status(200).json({ post: newPost, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { deleteUser, updateUser, changeCover };
