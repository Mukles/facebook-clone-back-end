const Conversation = require("../models/conversation");
const mongoose = require("mongoose");

const addConversation = async (req, res) => {
  try {
    const { sender, recipient, message } = req.body;

    const conversation = await Conversation.findOne({
      participants: { $in: [sender, recipient] },
    });

    if (conversation) {
      const updatedConversation = await Conversation.findOneAndUpdate(
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
          upsert: true,
          fields: { messages: { $slice: -1 } },
        }
      ).populate("participants");
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
    const limit = 8;
    const { sender, recipient } = req.query || {};
    let skip = !req.query.skip ? -limit : -(parseInt(req.query.skip) + limit);
    console.log({ skip });
    const objectId = mongoose.Types.ObjectId;

    const messages = await Conversation.aggregate([
      {
        $match: {
          participants: { $all: [objectId(sender), objectId(recipient)] },
        },
      },
      {
        $sort: { "messages.createdAt": -1 },
      },
      {
        $addFields: {
          count: { $size: "$messages" },
        },
      },
      {
        $project: {
          messages: { $slice: ["$messages", skip, limit] },
          count: 1,
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
          count: { $first: "$count" },
        },
      },
    ]);

    res.status(200).json(messages[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addConversation, getConversations, getMessages };
