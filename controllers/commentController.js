const Post = require("../models/Post");
const Comment = require("../models/comment");
const { default: mongoose } = require("mongoose");

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.aggregate([
      { $match: { post_id: mongoose.Types.ObjectId(postId) } },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "user_id",
          as: "user",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
      {
        $project: {
          _id: 1,
          post_id: 1,
          content: 1,
          likes: 1,
          img: 1,
          replies: 1,
          created_at: 1,
          "user.userName": 1,
          "user.profilePicture": 1,
          "user._id": 1,
        },
      },
      {
        $sort: { created_at: -1 },
      },
      {
        $skip: 0,
      },
      {
        $limit: 5,
      },
    ]);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { userId, postId, content } = req.body;
    const post = await Post.findOne({ _id: postId });

    console.log("file boosss", req.file);
    console.log("files", req.files);

    if (req.file !== undefined && post) {
      const protocol = req.protocol;
      const host = req.headers.host;
      const filename = req.file.filename;
      const img = protocol + "://" + host + "/comment/" + filename;
      const newComment = await new Comment({
        content,
        post_id: postId,
        user_id: userId,
        img,
      }).save();

      res.status(200).json(newComment);
    } else if (post) {
      const newComment = await new Comment({
        content,
        post_id: postId,
        user_id: userId,
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

const replyComment = async () => {
  try {
    const { commentId } = req.params;
    const { content, userId } = req.body;
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId },
      { $push: { replies: { content, userId } } }
    );
    res.status(200).json(comment);
  } catch (error) {}
};

module.exports = {
  getComments,
  addComment,
  editComment,
  deleteComment,
  replyComment,
};
