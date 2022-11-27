const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT;
const mongoUrl = process.env.MONGO_URL;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_ClIENT_SCCRET;
const clientUrl = process.env.CLIENT_URL;
const cookie_secret = process.env.COOKIE_SECRET;
const jwt_secret = process.env.JWT_SECRET;

module.exports = {
  port,
  mongoUrl,
  clientUrl,
  googleClientId,
  googleClientSecret,
  cookie_secret,
  jwt_secret,
};
