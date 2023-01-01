const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      message: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  lastMessage: {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
});

module.exports =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);
