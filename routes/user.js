const User = require("../models/user");
const router = require("express").Router();
const {
  changeCover,
  changeProfile,
  updateUser,
  suggestionFriends,
  sendFriendRequest,
  cancelFriendRequest,
  getRequestList,
  accpectFriendRequest,
  getUser,
  deleteFriendRequest,
  getRequestStatus,
  getNewsFeed,
  getFriendList,
  updateDeails,
} = require("../controllers/userController");
const upload = require("../middleware/fileUpload");

//UPDATE USER
router.put("/:id", updateUser);

//SUGGESTION FRIENDS
router.get("/suggestions/", suggestionFriends);

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
router.get("/:id", getUser);

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

//FRIEND REQUEST
router.post("/request/friend/:requestId", sendFriendRequest);

//CANCEL FRIEND REQUEST
router.put("/cancel/friend/:requestId", cancelFriendRequest);

//GET FIREND REQUEST LIST
router.get("/requestlist/:currentUserId", getRequestList);

//ACCEPT FIREND REQUEST
router.put("/request/accept/:requestId", accpectFriendRequest);

//DELELE FIREND REQUEST
router.delete("/request/delete/:requestId", deleteFriendRequest);

//GET FIREND REQUEST STATUS
router.get("/request/status", getRequestStatus);

//GET NEWS FEED
router.get("/newsfeed/:userId", getNewsFeed);

//GET ALL FRINEDS
router.get("/friend-list/:userId", getFriendList);

//PATCH USER
router.patch("/about/:userId", updateDeails);

module.exports = router;
