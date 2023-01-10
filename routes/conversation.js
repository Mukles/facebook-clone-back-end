const {
  addConversation,
  getConversations,
  getMessages,
} = require("../controllers/conversationController");

const router = require("express").Router();

//ADD A MESSAGE
router.patch("/add", addConversation);

//GET ALL COVNERSATION
router.get("/list", getConversations);

//GET ALL MESSAGES
router.get("/messages", getMessages);

module.exports = router;
