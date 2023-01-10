const Conversation = require("../models/conversation");
const mongoose = require("mongoose");

const addConversation = async (req, res) => {
  try {
    const { sender, recipient, message } = req.body;

    const conversation = await Conversation.findOne({
      participants: { $in: [sender, recipient] },
    });

    if (conversation) {
      const updatedConversation = await Conversation.updateOne(
        { participants: conversation.participants },
        {
          $set: {
            lastMessage: { sender, message, createdAt: Date.now() },
          },
          $push: {
            messages: { message, sender },
          },
        },
        {
          new: true,
        }
      );
      res.status(200).json(updatedConversation);
    } else {
      const newConversation = await new Conversation({
        participants: [sender, recipient],
        lastMessage: { sender, message, createdAt: Date.now() },
        messages: [{ message, sender }],
      }).save();
      res.status(200).json(newConversation);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const { sender } = req.query || {};
    const objectId = mongoose.Types.ObjectId;

    const conversation = await Conversation.aggregate([
      { $match: { participants: { $in: [objectId(sender)] } } },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $addFields: {
          lastMessage: "$lastMessage",
          user: "$user",
        },
      },
      {
        $project: {
          messages: 0,
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
      {
        $skip: 0,
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { sender, recipient } = req.query || {};
    console.log("sender", recipient);
    const objectId = mongoose.Types.ObjectId;
    const messages = await Conversation.aggregate([
      {
        $match: {
          participants: { $all: [objectId(sender), objectId(recipient)] },
        },
      },
      {
        $unwind: "$messages",
      },
      {
        $lookup: {
          from: "users",
          localField: "messages.sender",
          foreignField: "_id",
          as: "messages.sender",
        },
      },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" },
        },
      },
      {
        $project: { messages: 1 },
      },
      {
        $sort: { "messages.createdAt": -1 },
      },
      {
        $skip: 0,
      },
      {
        $limit: 5,
      },
    ]);

    res.status(200).json(messages[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addConversation, getConversations, getMessages };
