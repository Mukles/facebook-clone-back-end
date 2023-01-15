const { default: mongoose } = require("mongoose");

const PostShema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      require: true,
    },
    title: {
      type: String,
      max: 500,
    },
    caption: {
      type: String,
      max: 500,
    },
    img: {
      type: String,
    },
    likes: [
      {
        userId: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
        react: {
          type: String,
          enum: ["like", "love", "wow", "haha", "sad", "angry"],
        },
      },
    ],
    comments: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Post || mongoose.model("Post", PostShema);
