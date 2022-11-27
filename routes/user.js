const User = require("../models/user");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//UPDATE USER
router.put("/:id", async (req, res) => {
  const { userId, password } = req.body;
  const { id } = req.params;

  if (userId === id || req.user.isAdmin) {
    if (password) {
      try {
        const slat = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, slat);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }

    try {
      const user = await User.findOneAndUpdate(id, { $set: req.body });
      res.status(200).json({ message: "Account has been updated" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(403).json({ message: "You can update only your account" });
  }
});

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

module.exports = router;
