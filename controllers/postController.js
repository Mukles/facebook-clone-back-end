const User = require("../models/user");
const Post = require("../models/Post");
const { default: mongoose } = require("mongoose");

//ADD NEW POST
const postAdd = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      const post = await new Post({
        userId: user._id,
        ...req.body,
        img:
          req.protocol +
          "://" +
          req.headers.host +
          "/post/" +
          req.file.filename,
      }).save();
      await User.updateOne({ _Id: user._id }, { $push: { posts: post._id } });
      res.status(200).json({ message: "post added!", post });
    } else {
      res.status(400).json({ message: "User not found!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message, me: "djflaj" });
  }
};

//DELETE POST
const deletePost = async (req, res) => {
  console.log("I am delete here");
  try {
    console.log("dfjladsjf", req.params.id);
    const postId = mongoose.Types.ObjectId(req.params.id);
    console.log(postId);
    const { userId } = req.body;
    const post = await Post.aggregate([
      {
        $match: {
          $and: [{ _id: postId }, { userId: mongoose.Types.ObjectId(userId) }],
        },
      },
    ]);

    if (post) {
      await Post.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: "deleted successfully." });
    } else {
      res.status(500).json({ message: "Post not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET MY TIMELINE
const getTimeline = async (req, res) => {
  const { userId, email } = req.query;
  console.log(req.headers.host);

  try {
    const user = await User.findOne({ _id: userId });
    if (user) {
      const posts = await user.populate("posts");
      res.status(200).json(posts.posts);
    } else {
      res.status(500).json({ message: "user not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const postUpdate = async (req, res) => {
  const { email } = req.body;
  const { id } = req.params;
  const user = await User.findOne({ email });
  const post = await Post.findOne(id);

  try {
    if (user && post) {
      const post = await User.findOneAndUpdate({ email }, { ...req.body });
      res.status(200).json({ message: "post added!", post });
    } else {
      res.status(200).json({ message: "Inernal error!" });
    }
  } catch (err) {
    if (user && post) {
      const post = await User.findOneAndUpdate({ email }, { ...req.body });
      res.status(200).json({ message: "post added!", post });
    } else {
      res.status(200).json({ message: err.message });
    }
  }
};

module.exports = { postAdd, postUpdate, getTimeline, deletePost };
