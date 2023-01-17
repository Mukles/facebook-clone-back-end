const Post = require("../models/Post");
const Comment = require("../models/comment");
const { default: mongoose } = require("mongoose");

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query?.page);
    const skip = parseInt(req.query?.skip);
    const limit = page ? 5 : 1;

    console.log({ skip });

    const matchCount = await Comment.estimatedDocumentCount({
      post_id: postId,
    });

    const comments = await Comment.find({ post_id: postId })
      .populate("user")
      .populate("replies.user")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ comments, size: matchCount });
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
      const comment = await Comment.findById(newComment._id).populate("user");
      res.status(200).json(comment);
    } else if (post) {
      const newComment = await new Comment({
        content,
        post_id: postId,
        user: userId,
      }).save();
      const comment = await Comment.findById(newComment._id).populate("user");
      res.status(200).json(comment);
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
        { $push: { replies: { content, user: userId, img } } },
        { new: true }
      );
      const populatedComment = await Comment.findById(comment._id).populate({
        path: "replies.user",
        model: "User",
      });
      res.status(200).josn(populatedComment);
    } else {
      const comment = await Comment.findOneAndUpdate(
        { _id: commentId },
        {
          $push: {
            replies: {
              $each: [{ content, user: userId }],
              $position: 0,
            },
          },
        },
        { new: true, useFindAndModify: false }
      ).populate({ path: "replies.user", model: "User" });
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
