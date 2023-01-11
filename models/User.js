const mongoose = require("mongoose");

const userShema = new mongoose.Schema(
  {
    userName: {
      type: String,
      require: true,
      min: 3,
      max: 20,
    },
    email: { unique: true, type: String, require: true, max: 50 },
    dateOfBrith: { type: String },
    profilePicture: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      require: true,
      min: 30,
      max: 200,
    },
    converPicture: {
      type: String,
      default: "",
    },
    friends: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    provider: {
      type: String,
    },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    desc: {
      type: String,
      max: 50,
    },
    city: {
      type: String,
      max: 50,
    },
    from: {
      type: String,
      max: 50,
    },
    relationShip: {
      type: Number,
      enum: [1, 2, 3],
    },
    gender: {
      type: String,
      enum: ["male", "other", "female"],
    },
    posts: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Post",
      },
    ],
    details: {
      work: [{ type: Object }],
      study: [{ type: Object }],
      university: [{ type: Object }],
      currentCity: [{ type: Object }],
      homeTown: [{ type: Object }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userShema);
