const {
  addConversation,
  getConversations,
} = require("../controllers/conversationController");

const router = require("express").Router();

//ADD A MESSAGE
router.patch("/add", addConversation);

//GET ALL MESSAGE
router.get("/", getConversations);

module.exports = router;
