const { default: mongoose } = require("mongoose");

const PostShema = new mongoose.Schema(
  {
    userId: {
      type: String,
      require: true,
    },
    caption: {
      type: String,
      max: 500,
    },
    img: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostShema);
