const User = require("../models/user");

const signInAndSignUp = async (req, res) => {
  const email = req.params.email;
  const { user } = req.body || {};
  try {
    const query = await User.findOne({ email }, { posts: 0, provider: 0 });

    if (query) {
      res.status(200).json({ user: query });
    } else {
      const firstName = user?.firstName;
      const lastName = user?.lastName;
      const result = await User({
        ...user,
        userName: user.userName || firstName + " " + lastName,
      }).save();

      const createdUser = {
        _id: result._id,
        bio: result.bio,
        userName: result.userName,
        email: result.email,
        dateOfBrith: result.dateOfBrith,
        gender: result.gender,
        isAdmin: result.isAdmin,
      };

      res
        .status(200)
        .json({ user: createdUser, message: "user added sucessfully" });
    }
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
};

module.exports = { signInAndSignUp };
