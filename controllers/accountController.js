const User = require("../models/User");

const signInAndSignUp = async (req, res) => {
  const email = req.params.email;
  const { user } = req.body || {};
  try {
    const query = await User.aggregate([
      { $match: { email: email } },
      {
        $limit: 1,
      },
      {
        $addFields: {
          numberOfFriends: { $size: "$friends" },
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "friends",
          localField: "_id",
          as: "friends",
        },
      },
      {
        $project: {
          posts: 0,
          provider: 0,
        },
      },
    ]);
    if (query.length) {
      res.status(200).json({ user: query.length ? query[0] : {} });
    } else {
      const firstName = user?.firstName;
      const lastName = user?.lastName;
      const result = await User({
        ...user,
        userName: user.userName || firstName + " " + lastName,
      }).save();

      res.status(200).json({ user: result, message: "user added sucessfully" });
    }
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
};

module.exports = { signInAndSignUp };
