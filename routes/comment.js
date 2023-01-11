const {
  addComment,
  getComments,
  replyComment,
} = require("../controllers/commentController");
const upload = require("../middleware/fileUpload");

const router = require("express").Router();

router.get("/:postId", getComments);
router.post("/", upload("comment").single("img"), addComment);
router.patch("/:commentId", upload("comment").single("img"), replyComment);

module.exports = router;
