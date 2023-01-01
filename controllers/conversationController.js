const Conversation = require("../models/conversation");
const mongoose = require("mongoose");

const addConversation = async (req, res) => {
  try {
    const { sender, recipient, message } = req.body;
    const newConversation = await Conversation.findOneAndUpdate(
      { participants: [sender, recipient] },
      {
        $set: { lastMessage: { sender, message } },
        $push: { messages: { message, sender } },
      },
      { new: true, upsert: true }
    );
    res.status(200).json(newConversation);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const { sender, recipient } = req.query || {};
    const objectId = mongoose.Types.ObjectId;
    const conversations = await Conversation.aggregate([
      {
        $match: { participants: [objectId(sender), objectId(recipient)] },
      },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addConversation, getConversations };
