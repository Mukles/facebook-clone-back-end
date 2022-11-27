const admin = require("../firebase.init");

const authCheck = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodetoken = await admin.auth().verifyIdToken(token);
    if (decodetoken) {
      return next();
    }
    res.status(500).json({ message: "Unauthorize user." });
  } catch (error) {
    res.status(500).json({ message: "internal Error" });
  }
};

module.exports = authCheck;
