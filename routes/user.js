const User = require("../models/user");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const {
  changeCover,
  changeProfile,
  updateUser,
} = require("../controllers/userController");
const upload = require("../middleware/fileUpload");

//UPDATE USER
router.put("/:id", updateUser);

//DELETE USER
router.delete("/:id", async (req, res) => {
  const { userId, isAdmin } = req.body;
  const { id } = req.params;

  if (userId === id || isAdmin) {
    try {
      await User.deleteOne(userId);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  } else {
    res.status(403).json({ message: "You can delete your account !" });
  }
});

//GET USER
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findOne(req.body.userId);
    const { password, updateAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//FOLLOW USER
router.put("/follow/:id", async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;
  if (userId !== id) {
    try {
      const user = await User.findById(id);
      const currentUser = await User.findById(userId);
      if (!user.followers.includes(userId)) {
        await user.updateOne({ $push: { followers: userId } });
        await currentUser.updateOne({ $push: { followings: id } });
        res.status(200).json({ message: "User has been followed" });
      } else {
        res.status(403).json({ message: "You already follow this user" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(403).json({ message: "You can't follow yourself" });
  }
});

//CHNAGED COVER
router.post("/cover", upload("cover").single("coverPhoto"), changeCover);

//CHNAGED PROFILE
router.post(
  "/profile",
  upload("profile").single("profilePhoto"),
  changeProfile
);

module.exports = router;
