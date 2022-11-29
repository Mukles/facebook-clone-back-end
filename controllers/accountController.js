const User = require("../models/user");

const signInAndSignUp = async (req, res) => {
  const email = req.params.email;

  try {
    const query = await User.findOne({ email })
      .select({ email: 1, userName: 1, dateOfBrith: 1, isAdmin: 1 })
      .exec();
    if (query) {
      res.status(200).json({ user: query });
    } else {
      const firstName = req.body.user?.firstName;
      const lastName = req.body.user?.lastName;
      const result = await new User({
        ...req.body.user,
        userName: req.body.user.usrName || firstName + " " + lastName,
      }).save();

      console.log(result);

      const user = {
        userName: result.userName,
        email: result.email,
        dateOfBrith: result.dateOfBrith,
        isAdmin: result.isAdmin,
      };

      res.status(200).json({ user, message: "user added sucessfully" });
    }
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
};

module.exports = { signInAndSignUp };
