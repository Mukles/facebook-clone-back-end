const User = require("../models/user");
const Post = require("../models/Post");

const postAdd = async (req, res) => {
  const { email } = req.params;
  console.log(req.body);

  try {
    const user = await User.findOne({ email });
    if (user) {
      const post = await new Post({ ...req.body }).save();
      res.status(200).json({ message: "post added!", post });
    } else {
      res.status(400).json({ message: "User not found!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
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

module.exports = { postAdd, postUpdate };
