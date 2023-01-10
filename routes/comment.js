const { addComment, getComments } = require("../controllers/commentController");
const upload = require("../middleware/fileUpload");

const router = require("express").Router();

router.get("/:postId", getComments);
router.post("/", upload("comment").single("img"), addComment);

module.exports = router;
