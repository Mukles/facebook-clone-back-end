const User = require("../models/user");
const Post = require("../models/Post");
const { default: mongoose } = require("mongoose");
const { updateOne } = require("../models/user");

//ADD NEW POST
const postAdd = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne(
      { email },
      {
        dateOfBrith: 0,
        converPicture: 0,
        provider: 0,
        isAdmin: 0,
        desc: 0,
        relationShip: 0,
        gender: 0,
        posts: 0,
      }
    );
    if (req.file !== undefined) {
      if (user) {
        const post = await new Post({
          userId: user._id,
          ...req.body,
          img:
            req.protocol +
            "://" +
            req.headers.host +
            "/post/" +
            req.file.filename,
        }).save();
        await User.updateOne({ _id: user._id }, { $push: { posts: post._id } });
        res.status(200).json({ message: "post added!", post, user });
      } else {
        res.status(400).json({ message: "User not found!" });
      }
    } else {
      const post = await new Post({
        userId: user._id,
        ...req.body,
        img: null,
      }).save();
      await User.updateOne({ _id: user._id }, { $push: { posts: post._id } });
      res.status(200).json({ message: "post added!", post, user });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//EDIT POST
const postUpdateWithoutImg = async (req, res) => {
  const id = req.params.id;
  const { userId, img, caption } = req.body || {};

  try {
    const post = await Post.findOneAndUpdate(
      { _id: id, userId },
      { $set: { caption, img: JSON.parse(img) } },
      { returnOriginal: false }
    );
    res.status(200).json({ message: "post updated!", post });
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
};

const postUpdateWithImg = async (req, res) => {
  const id = req.params.id;
  const { userId, caption } = req.body || {};
  try {
    const post = await Post.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          caption,
          img:
            req.protocol +
            "://" +
            req.headers.host +
            "/post/" +
            req.file.filename,
        },
      }
    );
    res.status(200).json({ message: "post updated!", post });
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
};

//DELETE POST
const deletePost = async (req, res) => {
  const userId = req.body?.userId;
  const postId = req.params?.id;
  try {
    await Post.findOneAndDelete({ _id: postId, userId });
    res.status(200).json({ message: "deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET MY TIMELINE
const getTimeline = async (req, res) => {
  const { userId } = req.query;

  try {
    const posts = await Post.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      { $skip: 0 },
      { $limit: 5 },
      {
        $addFields: {
          likeReact: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$likes",
                  as: "like",
                  cond: {
                    $eq: ["$$like.userId", mongoose.Types.ObjectId(userId)],
                  },
                },
              },
              0,
            ],
          },
          reactCount: {
            like: {
              $size: {
                $filter: {
                  input: "$likes",
                  as: "like",
                  cond: { $eq: ["$$like.react", "like"] },
                },
              },
            },
            love: {
              $size: {
                $filter: {
                  input: "$likes",
                  as: "like",
                  cond: { $eq: ["$$like.react", "love"] },
                },
              },
            },
            wow: {
              $size: {
                $filter: {
                  input: "$likes",
                  as: "like",
                  cond: { $eq: ["$$like.react", "wow"] },
                },
              },
            },
            haha: {
              $size: {
                $filter: {
                  input: "$likes",
                  as: "like",
                  cond: { $eq: ["$$like.react", "haha"] },
                },
              },
            },
            sad: {
              $size: {
                $filter: {
                  input: "$likes",
                  as: "like",
                  cond: { $eq: ["$$like.react", "sad"] },
                },
              },
            },
            angry: {
              $size: {
                $filter: {
                  input: "$likes",
                  as: "like",
                  cond: { $eq: ["$$like.react", "angry"] },
                },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          userId: 0,
          "user.isAdmin": 0,
          "user.posts": 0,
          "user.provider": 0,
          "user.updatedAt": 0,
          "user.createdAt": 0,
          "user.converPicture": 0,
        },
      },
    ]);

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//TOGGLE LIKE
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params || {};
    const { userId, react } = req.body || {};
    const likes = await Post.findOne({ _id: id, "likes.userId": userId });
    if (!react) {
      const updateLike = await Post.findOneAndUpdate(
        { _id: id, "likes.userId": userId },
        { $pull: { likes: { userId } } },
        { new: true }
      );
      res.status(200).json(updateLike);
    } else if (!likes) {
      const newReact = await Post.findOneAndUpdate(
        { _id: id },
        { $push: { likes: { userId, react } } },
        { new: true }
      );
      res.status(200).json(newReact);
    } else {
      const updateLike = await Post.findOneAndUpdate(
        { _id: id, "likes.userId": userId },
        { $set: { likes: { userId, react } } },
        { new: true }
      );
      res.status(200).json(updateLike);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  postAdd,
  postUpdateWithImg,
  postUpdateWithoutImg,
  getTimeline,
  deletePost,
  toggleLike,
};
