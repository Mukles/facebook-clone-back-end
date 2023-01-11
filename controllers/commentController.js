const Post = require("../models/Post");
const Comment = require("../models/comment");
const { default: mongoose } = require("mongoose");

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post_id: postId })
      .populate("user")
      .populate("replies.user")
      .sort({ created_at: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { userId, postId, content } = req.body;
    const post = await Post.findOne({ _id: postId });

    if (req.file !== undefined && post) {
      const protocol = req.protocol;
      const host = req.headers.host;
      const filename = req.file.filename;
      const img = protocol + "://" + host + "/comment/" + filename;
      const newComment = await new Comment({
        content,
        post_id: postId,
        user: userId,
        img,
      }).save();

      res.status(200).json(newComment);
    } else if (post) {
      const newComment = await new Comment({
        content,
        post_id: postId,
        user: userId,
      }).save();

      res.status(200).json(newComment);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const comment = await Comment.updateOne(
      { _id: commentId },
      { $set: { content } }
    );

    res.status(200).josn(comment);
  } catch (error) {
    res.status(500).josn({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    await Comment.deleteOne({ _id: commentId });
    res.status(200).json({ message: "deleted successfully!" });
  } catch (error) {
    res.status(500).josn({ message: error.message });
  }
};

const replyComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, userId } = req.body;

    if (req.file !== undefined) {
      const protocol = req.protocol;
      const host = req.headers.host;
      const filename = req.file.filename;
      const img = protocol + "://" + host + "/comment/" + filename;

      const comment = await Comment.findOneAndUpdate(
        { _id: commentId },
        { $push: { replies: { content, user: userId, img } } }
      );
      res.status(200).json(comment);
    } else {
      console.log({ userId });
      const comment = await Comment.findOneAndUpdate(
        { _id: commentId },
        { $push: { replies: { content, user: userId } } }
      );
      res.status(200).json(comment);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getComments,
  addComment,
  editComment,
  deleteComment,
  replyComment,
};
