const Post = require("../models/post");
const User = require("../models/User");
const router = require("express").Router();
const {
  postAdd,
  getTimeline,
  deletePost,
  postUpdateWithImg,
  postUpdateWithoutImg,
  toggleLike,
} = require("../controllers/postController");
const upload = require("../middleware/fileUpload");

//CREATE NEW POST
router.post("/add", upload("post").single("img"), postAdd);

//UPDATE POST
router.put("/:id", upload("post").none(), postUpdateWithoutImg);
router.patch("/:id", upload("post").single("img"), postUpdateWithImg);

//DELETE POST
router.delete("/:id", deletePost);

//Timeline
router.get("/", getTimeline);

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

//TIMELINE
router.get("/newsfeed", async (req, res) => {
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

//TOGGLE REACT
router.put("/:id/react", toggleLike);

module.exports = router;
