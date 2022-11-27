const Post = require("../models/post");
const User = require("../models/User");
const router = require("express").Router();

//CREATE NEW POST
router.post("/", async (req, res) => {
  try {
    const { userId, desc, img } = req.body;
    const newPost = new Post({ userId, desc, img });
    const post = await newPost.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//UPDATE POST
router.put("/post/:id", async (req, res) => {
  const { id } = req.params.id;
  const { tite, img, desc } = req.body;
  try {
    const post = await Post.findById(id);
    await post.updateOne({ $set: { tite, img, desc } });
    res.status(200).json({ message: "The post has been updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET POST

router.get(":/id", async (req, res) => {
  const { id } = req.params;

  try {
    const post = Post.findOne(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//LIKE POST
router.put("/:id/like", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(id);
    if (!post.likes.includes(userId)) {
      post.updateOne({ $push: { userId } });
      res.status(200).json({ message: "The post has been liked" });
    } else {
      post.updateOne({ $pull: { userId } });
      res.status(200).json({ message: "The post has been disliked" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//DELETE POST
router.delete("/post/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Post.deleteOne({ _id: id });
    res.status(200).json({ message: "post deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//TIMELINE
router.get("/timeline", async (req, res) => {
  const { userId } = req.body;

  try {
    const currentUser = await User.findById(userId);
    const posts = await Post.find({ userId: currentUser.id });
    const friendsPost = currentUser.followings.map((friend) => {
      friend.find({ userId: userId });
    });
    res.status(200).json(friendsPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
